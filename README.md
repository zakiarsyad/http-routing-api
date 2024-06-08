# HTTP-Round-Robin-API
These project is to simulate on how a server can distribute the requests to destionation servers using roung-robin algorithm, by pick 2 random destionation servers and choose a server who has a lower load.
There are 2 kind of servers:
- Routing API. The one who distributes the requests to destination servers
- Simple API. The destination server


## Running the project locally
We use docker compose to inititate Routing API server, and 3 Simple API servers
```
docker-compose -f docker-compose.yaml up -d
```

If we need to run the server individually, we can do this:
- Routing API
```
cd routing-api/
docker build -t routing-api  -f Dockerfile .
docker run routing-api
```
- Simple API
```
cd simple-api/
docker build -t simple-api  -f Dockerfile .
docker run simple-api
```

### Routing API
#### Round robin
This service will forward any incoming request into the destination server. This service record the forwarded request in a time window and will evaluate them in an interval. 
Example:
- `ROLLING_COUNT_TIMEOUT = 10000`. Meaning we have a 10-second window
- `ROLLING_COUNT_BUCKET = 10`. Meaning a time window will be divided into 10 buckets
- So the interval to rotate and evaluate the buckets' values is 1 second `ROLLING_COUNT_TIMEOUT / ROLLING_COUNT_BUCKET`

#### Healthcheck
This service will perform a HTTP call 
Example:
- `HEALTHCHECK_PERIOD = 5000`. Meaning the healthcheck will be performed in every 5 seconds

### Simple API
This service is only a simple API which has these endpoints
- `POST /` will receive a JSON object and return it as is
- `GET /healthcheck` for the Routing API to check the app readiness
- `POST /activate` to set the server status to be `NORMAL`
- `POST /deactive` to set the server status to be `ERROR` or `SLOW` for testing purposes, so we can simulate a case when the destination server is down / slow

## Test
In term of running the test we need to do these
- Routing API
```
cd routing-api/
npm i
npm run test
```

result:
```
-----------------|---------|----------|---------|---------|-------------------
File             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-----------------|---------|----------|---------|---------|-------------------
All files        |     100 |      100 |     100 |     100 |
 src             |     100 |      100 |     100 |     100 |
  app.ts         |     100 |      100 |     100 |     100 |
 src/routing     |     100 |      100 |     100 |     100 |
  round-robin.ts |     100 |      100 |     100 |     100 |
  server.ts      |     100 |      100 |     100 |     100 |
-----------------|---------|----------|---------|---------|-------------------             
```

- Simple API
```
cd simple-api/
npm i
npm run test
```

result:
```
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |     100 |      100 |     100 |     100 |                   
 helper            |     100 |      100 |     100 |     100 |                   
  logger.ts        |     100 |      100 |     100 |     100 |                   
  test_response.ts |     100 |      100 |     100 |     100 |                   
 src               |     100 |      100 |     100 |     100 |                   
  app.ts           |     100 |      100 |     100 |     100 |                   
-------------------|---------|----------|---------|---------|-------------------
```