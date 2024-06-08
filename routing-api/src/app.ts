import { RoundRobin } from "./routing/round-robin";
import { Server } from "./routing/server";
import express from 'express';

interface serverOptions {
    port: number;
    urls: string;
    rollingCountTimeout: number;
    rollingCountBuckets: number;
    errorThresholdPercentage: number;
    latencyThresholdPercentage: number;
    latencyThreshold: number;
    healthcheckPeriode: number;

}

interface App {
    app: express.Application;
    servers: Server[];
}

export async function createApp(options: serverOptions): Promise<App> {
    const {
        port,
        urls,
        rollingCountTimeout,
        rollingCountBuckets,
        errorThresholdPercentage,
        latencyThresholdPercentage,
        latencyThreshold,
        healthcheckPeriode,
    } = options;

    const servers = urls.split(",").map(url => {
        return new Server({
            url,
            rollingCountTimeout,
            rollingCountBuckets,
            errorThresholdPercentage,
            latencyThresholdPercentage,
            latencyThreshold,
            healthcheckPeriode,
        });
    });

    const roundRobin = new RoundRobin(servers);

    const app = express();

    app.set('port', port);
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // as a proxy basically we only want to forward any request
    // to destnation server as is
    app.use(
        "/*",
        async (req, res) => {
            const server = roundRobin.pick();

            try {
                const response = await server.fire({
                    method: req.method,
                    url: `${server.url}${req.baseUrl}`,
                    body: req.body,
                });

                res.status(response.status).send(response.data || {});
            } catch (err) {
                res.status(err.status || 500).send(err.data || {});
            }
        }
    );

    return {
        app,
        servers,
    };
}
