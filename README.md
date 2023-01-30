# HTTP-Round-Robin-API


These project is to simulate on how a server can distribute the requests to destionation servers using roung-robin algorithm, by pick 2 destionation servers and choose a server who has a lower load.
There are 2 kind of servers:
- Routing API. The one who distributes the requests to destination servers
- Simple API. The destination server


## Running the project locally
We can run the servers at one using these scenarios:
- 1 Routing API server, and 3 healthy Simple API servers
```
docker-compose -f docker-compose.yaml up -d
```

- 1 Routing API server, 2 healthy Simple API servers, and 1 error Simple API server
```
docker-compose -f docker-compose.yaml up -d
```

- 1 Routing API server, 2 healthy Simple API servers, and 1 slow Simple API server
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
All files        |   98.41 |    88.88 |    91.3 |   98.38 |                   
 helper          |     100 |      100 |     100 |     100 |                   
  logger.ts      |     100 |      100 |     100 |     100 |                   
 routing         |   97.61 |       80 |    87.5 |   97.56 |                   
  round_robin.ts |     100 |      100 |     100 |     100 |                   
  server.ts      |   96.77 |    76.92 |   84.61 |   96.66 | 72,79             
 src             |     100 |      100 |     100 |     100 |                   
  app.ts         |     100 |      100 |     100 |     100 |                   
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