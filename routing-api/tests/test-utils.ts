import { Server } from 'http';

import { createApp } from "../src/app";
import { MockApiServer, startApiServer } from "./mock-server/api-server";

export interface TestSuite {
    readonly server: Server;
    readonly mockApiServers: MockApiServer[];
    close: () => Promise<void>;
    reset: () => Promise<void>;
}

const urls = process.env.URLS || "http://localhost:3001,http://localhost:3002,http://localhost:3003";

export const createSuite = async (): Promise<TestSuite> => {
    const [mockServer1, mockServer2, mockServer3] = await Promise.all([
        startApiServer(),
        startApiServer(),
        startApiServer(),
    ]);

    const port1 = mockServer1.getListeningPortNumber();
    const port2 = mockServer2.getListeningPortNumber();
    const port3 = mockServer3.getListeningPortNumber();

    const { app, servers } = await createApp({
        port: 8081,
        urls: `http://localhost:${port1},http://localhost:${port2},http://localhost:${port3}`,
        rollingCountTimeout: 100,
        rollingCountBuckets: 10,
        errorThresholdPercentage: 10,
        latencyThresholdPercentage: 10,
        latencyThreshold: 50,
        healthcheckPeriode: 50,
    });

    const server = app.listen(app.get('port'));

    return {
        server,
        mockApiServers: [mockServer1, mockServer2, mockServer3],
        close: async () => {
            servers.forEach(el => el.clear());

            await Promise.all([
                new Promise<void>((resolve, reject) => {
                    server.close((err?: Error | undefined) => {
                        if (err !== undefined) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                }),
            ]);
        },
        reset: async () => {
            await Promise.all([
                mockServer1.reset(),
                mockServer2.reset(),
                mockServer3.reset(),
            ]);
        },
    };
};

export const initSuite = (): (() => TestSuite) => {
    let suite: TestSuite;

    before(async () => {
        suite = await createSuite();
    });

    after(async () => {
        await suite.close();
    });

    beforeEach(async () => {
        await suite.reset();
    });

    return () => suite;
};