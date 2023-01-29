import axios from "axios"

const rollingCountTimeout = Number(process.env.ROLLING_COUNT_TIMEOUT);
const rollingCountBuckets = Number(process.env.ROLLING_COUNT_BUCKET);
const errorThresholdPercentage = Number(process.env.ERROR_THRESHOLD_PERCENTAGE);
const latencyThresholdPercentage = Number(process.env.LATENCY_THRESHOLD_PERCENTAGE);
const latencyThreshold = Number(process.env.LATENCY_THRESHOLD);

interface Bucket {
    fires: number
    fails: number
    slows: number
}

interface FireRequest {
    url: string
    method: string
    body?: object
}

interface FireResponse {
    status: number
    data?: object
}

enum ResponseStatus {
    SUCCESS = "SUCCESS",
    FAIL = "FAIL"
}

export class Server {
    public url: string;
    public load: number;
    public errorRate: number;
    public slowRate: number;
    private timout: number;
    private buckets: number;
    private window: Bucket[];
    private bucketInterval: NodeJS.Timer;
    private errorThresholdPercentage: number;
    private latencyThresholdPercentage: number;
    private latencyThreshold: number;

    constructor(url: string) {
        this.url = url;
        this.load = 0;
        this.errorRate = 0;
        this.slowRate = 0;
        this.timout = rollingCountTimeout || 10000;
        this.buckets = rollingCountBuckets || 10;
        this.errorThresholdPercentage = errorThresholdPercentage || 20;
        this.latencyThresholdPercentage = latencyThresholdPercentage || 20;
        this.latencyThreshold = latencyThreshold || 3000;

        this.window = new Array();
        // prime the window with buckets
        for (let i = 0; i < this.buckets; i++) {
            this.window[i] = this.bucket();
        }

        // rotate the buckets periodically
        const interval = Math.floor(this.timout / this.buckets);
        this.bucketInterval = setInterval(
            () => { this.rotate() },
            interval
        );
    }

    /**
     * Check if the server is ready
     * @returns {boolean}
     */
    public isReady = (): boolean => {
        if (this.errorRate > this.errorThresholdPercentage || this.slowRate > this.latencyThresholdPercentage) {
            return false;
        }

        return true;
    }

    /**
     * Call the url destination and record the stat
     * @param options 
     * @returns {object}
     */
    public fire = async (options: FireRequest): Promise<FireResponse> => {
        const {
            url,
            method,
            body
        } = options;

        try {
            const latencyStartTime = Date.now();

            const response = await axios({
                url,
                method,
                data: body
            });

            const latency = Date.now() - latencyStartTime;

            this.recordStats(ResponseStatus.SUCCESS, latency);

            return {
                status: response.status,
                data: response.data || {}
            }
        } catch (err) {
            this.recordStats(ResponseStatus.FAIL);
            
            return {
                status: err.status || 500,
                data: err.data || {}
            }
        }


    }

    /**
     * Create a new bucket
     * @returns {Bucket}
     */
    private bucket = (): Bucket => {
        return {
            fires: 0,
            fails: 0,
            slows: 0,
        }
    };

    /**
     * Rotate and evaluate the bucket
     * @returns {void}
     */
    private rotate = (): void => {
        this.getStats();
        this.nextBucket();

        return;
    }

    /**
     * Create a new bucket and remove the earliest one
     * @returns {void}
     */
    private nextBucket = (): void => {
        this.window.pop();
        this.window.unshift(this.bucket());

        return;
    };

    /**
     * Get the aggragate value of the buckets
     * @returns {void}
     */
    private getStats = (): void => {
        const total = this.window.reduce((acc, val) => {
            Object.keys(acc).forEach(key => {
                (acc[key] += val[key] || 0);
            });

            return acc
        }, this.bucket());

        this.load = total.fires;
        this.errorRate = total.fails / total.fires;
        this.slowRate = total.slows / total.fires;

        return;
    }

    /**
     * Record the stats of a request
     * @param status 
     * @param responseTime 
     * @returns {void}
     */
    private recordStats = (status: ResponseStatus, responseTime?: number): void => {
        const bucket = this.window[0];

        bucket.fires++;

        if (status === ResponseStatus.FAIL) {
            bucket.fails++;
        }

        if (responseTime > this.latencyThreshold) {
            bucket.slows++;
        }

        return;
    }
}