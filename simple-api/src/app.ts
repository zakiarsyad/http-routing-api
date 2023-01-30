import express from 'express';
import { Logger, LoggerLevel } from '../helper/logger';
import { TestFlag, TestHelper } from '../helper/test_response';

const port = process.env.PORT || 8080;
const testFlag = process.env.TEST_FLAG || TestFlag.NORMAL;
const testSkipped = Number(process.env.TEST_SKIPPED) || 10;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const testHelper = new TestHelper(
    testFlag as TestFlag,
    testSkipped
);

app.get(
    '/healthcheck',
    async (req, res) => {
        Logger.log(LoggerLevel.INFO, "Healthcheck")

        const {
            status,
            data
        } = await testHelper.getResponse();

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
        } = await testHelper.getResponse(req.body);

        res.status(status).send(data);
    }
);

app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});

module.exports = app