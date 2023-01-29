import express from 'express';
import { Logger } from '../helper/logger';
import { RoundRobin } from '../routing/round_robin';
import { Server } from '../routing/server';

const app = express();
const port = process.env.PORT || 8080;
const urls = process.env.URLS || "http://localhost:3001,http://localhost:3002,http://localhost:3003";

const servers = urls.split(",").map(url => {
    return new Server(url);
});

const roundRobin = new RoundRobin(servers);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// as a proxy basically we only want to forward any request
// to destnation server as is
app.use(
    '/',
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