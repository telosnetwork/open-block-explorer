# 'OBE' (open-block-explorer)

## Currently in development  

Telos Mainnet: [https://explorer.telos.net](https://explorer.telos.net)  [![Netlify Status](https://api.netlify.com/api/v1/badges/dc86b4ba-d574-4594-8f3c-88976edea863/deploy-status)](https://app.netlify.com/sites/open-block-explorer/deploys)


Telos Testnet: [https://explorer-test.telos.net](https://explorer-test.telos.net) [![Netlify Status](https://api.netlify.com/api/v1/badges/8a778d87-a057-472f-ab3b-07d978faafaa/deploy-status)](https://app.netlify.com/sites/open-block-explorer-dev/deploys)  


## Installation 

### Install yarn package manager
Follow the installation instructions at:
https://classic.yarnpkg.com/en/

### Add Quasar CLI package
```bash
yarn global add @quasar/cli
```

### Note regarding Node version from [quasar docs](https://quasar.dev/quasar-cli/installation)

Do not use uneven versions of Node i.e. 13, 15, etc. These versions are not tested with Quasar and often cause issues due to their experimental nature. We highly recommend always using the LTS version of Node. 

### Clone repo
```bash
git clone https://github.com/telosnetwork/open-block-explorer
```

### Install the dependencies

```bash
cd open-block-explorer && yarn
```

### Restore .env file & check that the correct endpoints are set
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
