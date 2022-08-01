FROM node:16-alpine

WORKDIR /usr/src/app
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run compile:evm
RUN npm run test:evm

COPY $PWD/docker/* /usr/local/bin/
ENTRYPOINT ["/bin/sh", "/usr/local/bin/entrypoint.sh"]