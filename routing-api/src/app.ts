import express from 'express';

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// as a proxy basically we only want to forward any request
// to destnation server as is
app.use(
    '/',
    async (req, res) => {
        res.status(200).send({});
    }
);

app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});