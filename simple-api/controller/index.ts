import { Logger, LoggerLevel } from "../helper/logger";

interface Response {
    status: number
    data?: object
}

export enum ResponseStatus {
    NORMAL = "NORMAL",
    SLOW = "SLOW",
    ERROR = "ERROR",
}

export class Controller {
    private status: ResponseStatus;

    constructor() { }

    /**
     * Get dummy response based on a test flag
     * @returns {Response}
     */
    public process = async (body?: object): Promise<Response> => {
        const response = {
            status: 200,
            data: body || {}
        };

        if (this.status === ResponseStatus.ERROR) {
            response.status = 500;
            response.data = { message: "SERVER_ERROR" }

            Logger.log(LoggerLevel.ERROR, "Server is currently not available to process request");

            return response;
        } else if (this.status === ResponseStatus.SLOW) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    Logger.log(LoggerLevel.WARN, "Server is currently processing response with high latency");

                    resolve(response);
                }, 5000);
            });
        } else {
            return response;
        }
    }

    /**
     * Set the status of the server
     * @returns {void}
     */
    public updateStatus = (status: ResponseStatus): void => {
        this.status = status;

        return;
    };
}