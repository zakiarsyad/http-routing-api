import express from 'express';
import { Logger } from '../helper/logger';

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post(
    '/',
    async (req, res) => {
        Logger.requestInfo();
        
        res.status(200).send(req.body);
    }
);

app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});