# 'OBE' (open-block-explorer)

..

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
```

### Documentation
[Configuring quasar.conf.js](https://quasar.dev/quasar-cli/quasar-conf-js)  
[Vue 2 documentation](https://vuejs.org/v2/api/)  
[Vue 3 documenation](https://v3.vuejs.org/)  
[Testing Quasar with Jest](https://github.com/quasarframework/quasar-testing/tree/next/packages/unit-jest)