# actions-setup
GitHub Actions for setting up earthly

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
      - uses: earthly/actions-setup@v1
        with:
          version: "latest" # or pin to an specific version, e.g. "v0.6.10"
      - uses: actions/checkout@v2
      - name: Docker login # to avoid dockerhub rate-limiting
        run: docker login --username "${{ secrets.DOCKERHUB_USERNAME }}" --password "${{ secrets.DOCKERHUB_PASSWORD }}"
      - name: what version is installed?
        run: earthly --version
      - name: run the earthly hello world
        run: earthly github.com/earthly/hello-world:main+hello
```

