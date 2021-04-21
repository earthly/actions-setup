# actions
GitHub Actions for earthly

Here's an example of how to use earthly in github actions:


```yml
name: GitHub Actions CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  tests:
    name: example earthly test
    runs-on: ubuntu-latest
    steps:
      - uses: earthly/actions/setup-earthly@main
        with:
          version: v0.5.10
      - uses: actions/checkout@v2
      - name: what version is installed?
        run: earthly --version
      - name: run the earthly hello world
        run: earthly github.com/earthly/hello-world:main+hello
```
