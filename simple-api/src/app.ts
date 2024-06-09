import express from "express";
import { Logger, LoggerLevel } from "../helper/logger";
import { Controller, ResponseStatus } from "../controller/index"

const port = process.env.PORT || 8080;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const controller = new Controller();

app.get(
    "/healthcheck",
    async (req, res) => {
        Logger.log(LoggerLevel.INFO, "Healthcheck")

        const {
            status,
            data
        } = await controller.process();

        res.status(status).send(data);
    }
);

app.post(
    "/transactions",
    async (req, res) => {
        Logger.requestInfo();

        const {
            status,
            data
        } = await controller.process(req.body);

        res.status(status).send(data);
    }
);

app.post(
    "/activate",
    async (req, res) => {
        await controller.updateStatus(ResponseStatus.NORMAL);

        res.status(200).send({});
    }
);

app.post(
    "/deactivate",
    async (req, res) => {
        const { status } = req.body;

        await controller.updateStatus(status);

        res.status(200).send({});
    }
);

app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});

module.exports = app