

### Clone repo
```bash
git clone https://github.com/yu1195174476/zj-block-explorer
```

### Install the dependencies

```bash
nvm use 14
```


```bash
cd zj-block-explorer && yarn
```

### Restore .env file, set default chain and optionally enable multiple chains
```bash
cp .env.example .env
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
yarn dev
```

### Run test suite
```bash
yarn test
```

### Lint the files
```bash
yarn lint
```

### Build the app for production
```bash
yarn build
cd dist/spa
quasar serve
```
app running at localhost:4000

### Documentation
[Configuring quasar.conf.js](https://quasar.dev/quasar-cli/quasar-conf-js)

[Vue 2 documentation](https://vuejs.org/v2/api/)

[Vue 3 documenation](https://v3.vuejs.org/)

[Testing Quasar with Jest](https://github.com/quasarframework/quasar-testing/tree/next/packages/unit-jest)




