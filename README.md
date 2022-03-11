# 'OBE' (open-block-explorer)

## Introduction

The Open Block Explorer (OBE) is the first OPEN SOURCE block explorer that is designed to support all EOSIO-based blockchains. This includes, amongst others, the following public and private chains: Telos, EOS, WAX, Ultra, Proton, UX and FIO.

The currently most utilized Telos and EOSIO based block explorers are feature-rich but closed source, which incorporates a high risk in case services are discontinued or access is restricted due to other reasons.

Since Telos has been put into a simular situtation for the native blockchain, the chain decided to initiate the OBE-Project which was kickstarted with resources of the [Telos Core Development (TCD)](https://www.telos.net) and further resources of the Telos Block Providers [Persiantelos](https://persiantelos.com) and [nodenode](https://www.nodenode.org) (Lead by Rami James who is recognized for his UX/UI work for the EOS signer and wallet [Scatter](https://github.com/GetScatter)). 

While the first iterations are driven by the Telos project team, we are welcoming anybody who wishes to contribute and actively develop this open source solution for the EOSIO ecosystem!

The Open Block Explorer codebase will benefit all EOSIO developers and chain by open sourcing a critical part of the infrastructure.

## Functional reference products

EOSIO based chains require specific components, of which various are historically managed within the various block explorers.

This includes following key features:

- Transaction log including extensive filter options
- Smart Contract verification
- Ressource management and staking (CPU, NET, RAM)
- REX staking / unstaking / savings
- Account power up 
- Ressource trading (RAM)
- Multi-Signature (MSIG) setup and management
- Wallet functionality (non custodial), including transafer
- Permission and key managament (active / onwer)
- Chain and Block Provider (BP) statistics
- BP Voting and Governance
- Premium Name bids

Following, excelent products can be taken as reference points for further features:

- [EOS Authority](https://eosauthority.com/)
- [Blocks](https://bloks.io/)
- [EOSX](https://telos.eosx.io/)


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

### Key Contributors

