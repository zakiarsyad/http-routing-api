import { Logger, LoggerLevel } from "./logger";

interface TestResponse {
    status: number
    data?: object
}

export enum TestFlag {
    NORMAL = "NORMAL",
    SLOW = "SLOW",
    ERROR = "ERROR",
}

export class TestHelper {
    private testFlag: TestFlag;
    private testSkipped: number;

    constructor(testFlag: TestFlag, testSkipped: number) {
        this.testFlag = testFlag;
        this.testSkipped = testSkipped;
    }

    /**
     * Get dummy response based on a test flag
     * @returns {TestResponse}
     */
    public getResponse = async (body?: object): Promise<TestResponse> => {
        const response = {
            status: 200,
            data: body || {}
        };

        if (this.testSkipped > 0) {
            this.testSkipped--;
            return response;
        }

        if (this.testFlag === TestFlag.SLOW) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    Logger.log(LoggerLevel.WARN, "Server is currently processing response with high latency");

                    resolve(response);
                }, 5000);
            });
        } else if (this.testFlag === TestFlag.ERROR) {
            response.status = 500;
            response.data = { error_code: "SERVER_ERROR" }

            Logger.log(LoggerLevel.ERROR, "Server is currently not available to process request");

            return response;
        } else {
            return response;
        }
    }
}