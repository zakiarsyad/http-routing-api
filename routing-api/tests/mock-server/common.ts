import { Server } from 'http';

export interface MockServer {
    close: () => Promise<void>;
    getListeningPortNumber: () => number;
}

function makeClose(server: Server): () => Promise<void> {
    return (): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
            server.close((err?: Error | undefined) => {
                if (err !== undefined) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    };
}

function makeGetListeningPortNumber(server: Server): () => number {
    return (): number => {
        return (server.address() as { port: number }).port;
    };
}

export function baseMockServer(server: Server): MockServer {
    return {
        close: makeClose(server),
        getListeningPortNumber: makeGetListeningPortNumber(server),
    };
}
