npm-base:
    FROM alpine:3.13.5
    RUN apk add --update nodejs npm
    COPY ./package.json ./
    COPY ./package-lock.json ./
    RUN npm install
    # Output these back in case npm install changes them.
    SAVE ARTIFACT package.json AS LOCAL ./package.json
    SAVE ARTIFACT package-lock.json AS LOCAL ./package-lock.json

code:
    FROM +npm-base
    WORKDIR /code
    COPY package.json package-lock.json .
    RUN npm ci
    COPY --dir src .

lint:
    FROM +code
    COPY .eslintrc.js .
    RUN npm run-script lint

compile:
    FROM +code
    WORKDIR /code
    RUN npm ci
    COPY tsconfig.json .
    RUN npm run-script package
    SAVE ARTIFACT dist AS LOCAL dist
    SAVE ARTIFACT node_modules AS LOCAL node_modules

test:
    FROM +code
    COPY tsconfig.json .
    COPY jest.config.js .
    RUN npm test

all:
    BUILD +lint
    BUILD +compile
    BUILD +test
