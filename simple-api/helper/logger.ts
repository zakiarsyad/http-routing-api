export class Logger {
    private static requestCounter: number = 0;

    /**
     * Log the request coming to the server
     * @returns {void}
     */
    public static requestInfo = () => {
        // add the counter for testing purpose
        this.requestCounter++;

        console.log({
            message: `[Info] Incoming request - processing ${this.requestCounter} requests`
        });

        return;
    }

    /**
     * Log if there is an warning on the server
     * @returns {void}
     */
    public static warn = (message) => {
        console.log({
            message: `[Warn] ${message}`
        });

        return;
    }

    /**
     * Log if there is an error on the server
     * @returns {void}
     */
    public static error = (message) => {
        console.log({
            message: `[Error] ${message}`
        });

        return;
    }
}