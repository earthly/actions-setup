VERSION 0.6

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

test-compile-was-run:
    FROM alpine:3.13.5
    COPY dist /from-git
    COPY +compile/dist /from-compile
    RUN diff -r /from-git /from-compile >/dev/null || (echo "dist and +compile/dist are different, did you forget to run earthly +compile?" && exit 1)

test:
    FROM +code
    COPY tsconfig.json .
    COPY jest.config.js .
    RUN npm test

test-run:
    FROM +npm-base
    COPY --dir +compile/dist .
    ENV RUNNER_TOOL_CACHE=/tmp/cache-dir
    RUN node dist/setup/index.js | tee output
    RUN ! grep 'Found tool in cache' output
    RUN cat output | grep '^::add-path::' | sed 's/::add-path:://g' > earthly-path
    RUN test "$(cat earthly-path)" = "/root/.earthly/bin"
    # [a-zA-Z0-9]* attempt to match a commit hash
    RUN export PATH="$(cat earthly-path):$PATH" && earthly --version | tee version.output
    RUN grep '^earthly version v.*linux/amd64; Alpine Linux' version.output

    # validate cache was used
    RUN node dist/setup/index.js | tee output2
    RUN grep 'Found tool in cache' output2

lint-newline:
    FROM alpine:3.15
    WORKDIR /everything
    COPY . .
    # test that line endings are unix-style
    RUN set -e; \
        code=0; \
        for f in $(find . -type f \( -iname '*.ts' -o -iname 'Earthfile' \) | grep -v node_modules); do \
            if ! dos2unix < "$f" | cmp - "$f"; then \
                echo "$f contains windows-style newlines and must be converted to unix-style (use dos2unix to fix)"; \
                code=1; \
            fi; \
        done; \
        exit $code
    # test file ends with a single newline
    RUN set -e; \
        code=0; \
        for f in $(find . -type f \( -iname '*.ts' -o -iname 'Earthfile' \) | grep -v node_modules); do \
            if [ "$(tail -c 1 $f)" != "$(printf '\n')" ]; then \
                echo "$f does not end with a newline"; \
                code=1; \
            fi; \
        done; \
        exit $code
    # check for files with trailing newlines
    RUN set -e; \
        code=0; \
        for f in $(find . -type f \( -iname '*.ts' -o -iname 'Earthfile' \) | grep -v node_modules); do \
            if [ "$(tail -c 2 $f)" == "$(printf '\n\n')" ]; then \
                echo "$f has trailing newlines"; \
                code=1; \
            fi; \
        done; \
        exit $code


all:
    BUILD +lint
    BUILD +lint-newline
    BUILD +compile
    BUILD +test
    BUILD +test-run
    BUILD +test-compile-was-run
