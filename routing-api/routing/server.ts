import axios from "axios";

interface Bucket {
    fires: number
    fails: number
    slows: number
}

interface FireRequest {
    url: string
    method?: string
    body?: object
}

interface FireResponse {
    status: number
    data?: object
}

interface ServerOptions {
    url: string
    rollingCountTimeout: number
    rollingCountBuckets: number
    errorThresholdPercentage: number
    latencyThresholdPercentage: number
    latencyThreshold: number
    healthcheckPeriode: number
}

export enum ResponseStatus {
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
    private healthcheckInterval: NodeJS.Timer;
    private errorThresholdPercentage: number;
    private latencyThresholdPercentage: number;
    private latencyThreshold: number;
    private healthcheckPeriode: number;

    constructor(options: ServerOptions) {
        this.url = options.url;
        this.timout = options.rollingCountTimeout || 10000;
        this.buckets = options.rollingCountBuckets || 10;
        this.errorThresholdPercentage = options.errorThresholdPercentage || 20;
        this.latencyThresholdPercentage = options.latencyThresholdPercentage || 20;
        this.latencyThreshold = options.latencyThreshold || 3000;
        this.healthcheckPeriode = options.healthcheckPeriode || 5000;
        
        this.load = 0;
        this.errorRate = 0;
        this.slowRate = 0;

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

        // call the server's healtcheck endpoint periodically
        this.healthcheckInterval = setInterval(
            () => {
                this.fire({
                    url: this.url + "/healthcheck",
                    method: "get"
                })
            },
            this.healthcheckPeriode
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
     * Get the aggragate value of the buckets
     * @returns {void}
     */
    public updateStats = (): void => {
        const total = this.window.reduce((acc, val) => {
            Object.keys(acc).forEach(key => {
                (acc[key] += val[key] || 0);
            });

            return acc;
        }, this.bucket());

        this.load = total.fires;
        this.errorRate = (total.fails / total.fires) * 100;
        this.slowRate = (total.slows / total.fires) * 100;

        return;
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

            return err;
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
     * Rotate the bucket
     * @returns {void}
     */
    private rotate = (): void => {
        this.window.pop();
        this.window.unshift(this.bucket());

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