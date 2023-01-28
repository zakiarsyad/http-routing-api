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
}