import { Logger, LoggerLevel } from "../helper/logger";
import { Server } from "./server";

export class RoundRobin {
    private servers: Server[];

    constructor(servers: Server[]) {
        this.servers = servers;
    }

    public pick = () => {
        let a = this.getServer();
        let b = this.getServer(a.url);

        const result = a.load < b.load ? a : b;

        // Log where a request is routed to
        Logger.log(LoggerLevel.INFO, "===============================");
        Logger.log(LoggerLevel.INFO, `Load server ${a.url} = ${a.load}`);
        Logger.log(LoggerLevel.INFO, `Load server ${b.url} = ${b.load}`);
        Logger.log(LoggerLevel.INFO, `Request routed to ${result.url}`);
        Logger.log(LoggerLevel.INFO, "===============================");

        return result;
    }

    /**
     * Get a random ready server
     * @returns {Server}
     */
    private getServer = (url?: string): Server => {
        const servers = [...this.servers];

        let i = Math.trunc(Math.random() * servers.length);

        let server = servers[i];
        server.updateStats();

        // choose anothe server if the current server is not ready
        // or the same with previous server
        let serverPicked: number = 1;
        let isReady = server.isReady();
        let serverUrl = server.url;

        while ((!isReady || serverUrl === url) && serverPicked <= servers.length) {
            servers.splice(i, 1);

            i = Math.trunc(Math.random() * servers.length);

            server = servers[i];
            server.updateStats();

            isReady = server.isReady();
            serverUrl = server.url;

            serverPicked++;
        }

        return server;
    }
}