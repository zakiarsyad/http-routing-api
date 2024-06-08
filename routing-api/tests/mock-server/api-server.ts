
import express from 'express';
import { baseMockServer, MockServer } from './common';

export interface MockApiServer extends MockServer {
    readonly getTxnCounter: () => number;
    readonly stop: () => void;
    readonly run: () => void;
    readonly delay: () => void;
    readonly reset: () => void;
}

export const startApiServer = async (): Promise<MockApiServer> => {
    let txnCounter: number = 0;
    let delay: number = 0;
    let status: number = 200;

    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.post('/transactions', (req, res) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                txnCounter++;
                resolve(res.status(status).json({}));
            }, delay);
        });
    });

    app.get('/healthcheck', (req, res) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(res.status(status).json({}));
            }, delay);
        });
    });

    return {
        ...baseMockServer(app.listen()),
        reset: () => {
            txnCounter = 0;
            status = 200;
            delay = 0;
        },
        getTxnCounter: () => txnCounter,
        stop: () => {
            status = 500;
        },
        run: () => {
            delay = 0;
            status = 200;
        },
        delay: () => {
            delay = 60;
            status = 200;
        },
    };
};
