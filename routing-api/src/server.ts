import gracefulShutdown from 'http-graceful-shutdown';
import { createApp } from "./app";

const port = Number(process.env.PORT) || 8080;
const urls = process.env.URLS || "http://localhost:3001,http://localhost:3002,http://localhost:3003";
const rollingCountTimeout = Number(process.env.ROLLING_COUNT_TIMEOUT) || 10000;
const rollingCountBuckets = Number(process.env.ROLLING_COUNT_BUCKET) || 10;
const errorThresholdPercentage = Number(process.env.ERROR_THRESHOLD_PERCENTAGE) || 10;
const latencyThresholdPercentage = Number(process.env.LATENCY_THRESHOLD_PERCENTAGE) || 10;
const latencyThreshold = Number(process.env.LATENCY_THRESHOLD) || 3000;
const healthcheckPeriode = Number(process.env.HEALTHCHECK_PERIOD) || 5000;

// ref: https://adamcrowder.net/posts/node-express-api-and-aws-alb-502/
const IDLE_TIMEOUT = 60;

/**
 * Start an Express server and installs signal handlers on the
 * process for graceful shutdown.
 */
(async () => {
    try {
        const { app } = await createApp({
            port,
            urls,
            rollingCountTimeout,
            rollingCountBuckets,
            errorThresholdPercentage,
            latencyThresholdPercentage,
            latencyThreshold,
            healthcheckPeriode,
        });
        const server = app.listen(app.get('port'), () => {
            console.log(`Started express server`);
        });

        server.keepAliveTimeout = (IDLE_TIMEOUT + 1) * 1000;
        server.headersTimeout = (IDLE_TIMEOUT + 5) * 1000;

        gracefulShutdown(server);
    } catch (err) {
        console.log('error caught in server.ts');
    }
})();
