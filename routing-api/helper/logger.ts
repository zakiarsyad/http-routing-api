export enum LoggerLevel {
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR"
}

export class Logger {
    private static requestCounter: number = 0;

    /**
     * Log and count the request coming to the server
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
     * Log an event based on the level
     * @param level 
     * @param message 
     * @returns {void}
     */
    public static log = (level: LoggerLevel, message: string) => {
        console.log({
            message: `[${level}] ${message}`
        });

        return;
    }
}