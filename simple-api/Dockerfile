# Image Builder
FROM node:16-alpine

# Allow for Docker caching of node modules
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
COPY tsconfig.json /app/tsconfig.json
WORKDIR /app
RUN npm ci

# Copy the rest of the application
COPY . /app

RUN npm run build

CMD ["npm", "run" ,"start"]