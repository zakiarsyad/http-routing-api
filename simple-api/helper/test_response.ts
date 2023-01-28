interface TestResponse {
    status: number
    data?: object
}

enum TestFlag {
    NORMAL = "NORMAL",
    SLOW = "SLOW",
    ERROR = "ERROR",
}

const testFlag = process.env.TEST_FLAG || TestFlag.NORMAL;
const testPeriod = process.env.TEST_PERIOD;

export class TestHelper {
    private static normalTestCount: number = Number(testPeriod) || 20;

    /**
     * Get dummy response based on a test flag
     * @returns {TestResponse}
     */
    public static getResponse = async (body?: object): Promise<TestResponse> => {
        const response = {
            status: 200,
            data: body || {}
        };

        if (this.normalTestCount > 0) {
            this.normalTestCount--;
            return response;
        }

        if (testFlag === TestFlag.SLOW) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve(response);
                }, 5000);
            });

        } else if (testFlag === TestFlag.ERROR) {
            response.status = 500;
            response.data = { error_code: "SERVER_ERROR" }
            return new Promise((resolve, reject) => {
                resolve(response)
            });
        } else {
            return new Promise((resolve, reject) => {
                resolve(response)
            });
        }
    }
}