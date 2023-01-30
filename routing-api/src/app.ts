import express from "express";
import { Logger } from "../helper/logger";
import { RoundRobin } from "../routing/round_robin";
import { Server } from "../routing/server";

const app = express();
const port = process.env.PORT || 8080;
const urls = process.env.URLS || "http://localhost:3001,http://localhost:3002,http://localhost:3003";
const rollingCountTimeout = Number(process.env.ROLLING_COUNT_TIMEOUT) || 10000;
const rollingCountBuckets = Number(process.env.ROLLING_COUNT_BUCKET) || 10;
const errorThresholdPercentage = Number(process.env.ERROR_THRESHOLD_PERCENTAGE) || 10;
const latencyThresholdPercentage = Number(process.env.LATENCY_THRESHOLD_PERCENTAGE) || 10;
const latencyThreshold = Number(process.env.LATENCY_THRESHOLD) || 3000;
const healthcheckPeriode = Number(process.env.HEALTHCHECK_PERIOD) || 5000;

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// as a proxy basically we only want to forward any request
// to destnation server as is
app.use(
    "/",
    async (req, res) => {
        Logger.requestInfo();

        const server = roundRobin.pick();

        try {
            const response = await server.fire({
                method: req.method,
                url: server.url,
                body: req.body,
            });

            res.status(response.status).send(response.data || {});
        } catch (err) {
            res.status(err.status || 500).send(err.data || {});
        }
    }
);

app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});

module.exports = app;