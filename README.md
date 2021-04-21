# actions
GitHub Actions for earthly

To use earthly with hithub actions, create a file under `.github/workflows/ci.yml` with the contents:

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
      - uses: earthly/actions/setup-earthly@v1
        with:
          version: v0.5.10
      - uses: actions/checkout@v2
      - name: what version is installed?
        run: earthly --version
      - name: run the earthly hello world
        run: earthly github.com/earthly/hello-world:main+hello
```

