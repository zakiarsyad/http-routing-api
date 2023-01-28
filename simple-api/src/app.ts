import express from 'express';
import { Logger } from '../helper/logger';
import { TestHelper } from '../helper/test_response';

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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