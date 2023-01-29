import { Server } from "./server";

export class RoundRobin {
    private servers: Server[];

    constructor(servers: Server[]) {
        this.servers = servers;
    }

    public pick = () => {
        let a = this.getServer();
        let b = this.getServer(a.url);

        console.log(`Load server ${a.url} = ${a.load}`);
        console.log(`Load server ${b.url} = ${b.load}`);

        const result = a.load < b.load ? a : b;

        console.log(`Request routed to ${result.url}`);

        return result;
    }

    /**
     * Get a random ready server
     * @returns {Server}
     */
    private getServer = (url?: string): Server => {
        let i = Math.trunc(Math.random() * this.servers.length);

        // choose anothe server if the current server is not ready
        // or the same with previous server
        while (!this.servers[i].isReady() || this.servers[i].url === url) {
            i = Math.trunc(Math.random() * this.servers.length);
        }

        return this.servers[i];
    }
}