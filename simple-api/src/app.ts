import express from 'express';
import { Logger, LoggerLevel } from '../helper/logger';
import { TestHelper } from '../helper/test_response';

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get(
    '/healthcheck',
    async (req, res) => {
        Logger.log(LoggerLevel.INFO, "Healthcheck")

        const {
            status,
            data
        } = await TestHelper.getResponse();

        res.status(status).send(data);
    }
);

app.post(
    '/',
    async (req, res) => {
        Logger.requestInfo();

        const {
            status,
            data
        } = await TestHelper.getResponse(req.body);

        res.status(status).send(data);
    }
);

app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});