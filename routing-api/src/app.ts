import express from 'express';
import axios from "axios"

const app = express();
const port = process.env.PORT || 8080;
const urls = process.env.URLS || "http://localhost:3001,http://localhost:3002,http://localhost:3003";

const servers = urls.split(",")

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// as a proxy basically we only want to forward any request
// to destnation server as is
app.use(
    '/',
    async (req, res) => {
        try {
            const response = await axios({
                url: servers[0],
                method: req.method,
                data: req.body
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