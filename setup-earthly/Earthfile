npm-base:
    FROM alpine:3.13.5
    RUN apk add --update nodejs npm
    RUN npm i -g @vercel/ncc
    RUN npm i -g eslint

code:
    FROM +npm-base
    WORKDIR /code
    COPY package.json package-lock.json .
    RUN npm ci
    COPY --dir src .

lint:
    FROM +code
    COPY .eslintrc.json .
    RUN eslint src/*.js

compile:
    FROM +code
    WORKDIR /code
    COPY package.json package-lock.json .
    RUN npm ci
    COPY --dir src .
    RUN ncc build src/*.js
    SAVE ARTIFACT dist AS LOCAL dist
    SAVE ARTIFACT node_modules AS LOCAL node_modules

all:
    BUILD +lint
    BUILD +compile
