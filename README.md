# Routing API
These project is to simulate on how a server can distribute the requests to destionation servers using round-robin algorithm, by pick 2 random destionation servers and choose a server who has a lower load.
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

## Simulate the traffic distribution
Once the necessary servers are running, we can simulate these scenarios by using Postman (or any similar app) to trigger multiple requests (in this example let's use 100 request).
```
curl --location --request POST 'http://localhost:3000/transactions' \
--data ''
```

### If all Simple API servers are running
If all the Simple API servers are running okay, all request will be distributed almost evenly to each server.

### If one of the Simple API servers are returning error
We can simulate an error from one server, by calling this endpoint:
```
curl --location 'http://localhost:3001/deactivate' \
--header 'Content-Type: application/json' \
--data '{
    "status": "ERROR"
}'
```
It will make one of the Simple API servers returning an error. Then the current traffic will only be distributed to the remaining health servers.
The traffic will be routed back to this server once we evaluate if the error is not occured anymore, using `GET /healthcheck` call.

We also can trigger it manually to make it healthy, bu calling this endpoint:
```
curl --location --request POST 'http://localhost:3001/activate'
```

### If one of the Simple API servers are slowing down
We can simulate a case where a server going slow, by calling this endpoint:
```
curl --location 'http://localhost:3001/deactivate' \
--header 'Content-Type: application/json' \
--data '{
    "status": "SLOW"
}'
```

It will make one of the Simple API servers processing request with a 5 seconds time gap, to simulate a latency. Then the current traffic will only be distributed to the remaining health servers.
The traffic will be routed back to this server once we evaluate if the error is not occured anymore, using `GET /healthcheck` call.

## Unit Test
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