# 'OBE' (open-block-explorer)

Telos Main Net: [https://explorer.telos.net](https://explorer.telos.net)  [![Netlify Status](https://api.netlify.com/api/v1/badges/dc86b4ba-d574-4594-8f3c-88976edea863/deploy-status)](https://app.netlify.com/sites/open-block-explorer/deploys)

Telos Test Net: [https://explorer-test.telos.net](https://explorer-test.telos.net) [![Netlify Status](https://api.netlify.com/api/v1/badges/8a778d87-a057-472f-ab3b-07d978faafaa/deploy-status)](https://app.netlify.com/sites/open-block-explorer-dev/deploys)

[![GitHub release (latest by date)](https://img.shields.io/github/v/release/telosnetwork/open-block-explorer?url=https://github.com/telosnetwork/open-block-explorer/releases/latest&style=for-the-badge)](https://github.com/telosnetwork/open-block-explorer/releases/latest)

![License](https://img.shields.io/github/license/telosnetwork/open-block-explorer?style=for-the-badge)

## About

The Open Block Explorer (OBE) is the first OPEN SOURCE block explorer that is designed to support all AntelopeIO-based blockchains. This includes, amongst others, the following public and private chains: Telos, EOS, WAX, Ultra, Proton, UX and FIO.

Currently, the most-utilized Telos and AntelopeIO-based block explorers are feature-rich but _closed source_. This is problematic as it creates a central point of control (and failure), with no easy remedy, should those services be discontinued or otherwise restricted, essentially holding applications hostage that depend on those api endpoints for data and simultaneously abandoning users that rely on such services. This is the antithesis of decentralization.  By developing an open-source explorer with an API utilizing an _identical_ endpoint convention, _anyone_ can clone and operate their own explorer and/or api without fear of losing service or access.

Because creating multiple versions of closed-source block explorers is a poor use of development resources for the Antelope community, Telos has undertaken the task of developing an open-source, feature-rich block explorer that _any_ Antelope blockchain may deploy. The OBE-Project was kickstarted with resources of the [Telos Core Developers (TCD)](https://www.telos.net) (Strategy/Architecture: Douglas Horn [GoodBlock](https://goodblock.io), Technical Design: Jesse Schulman [CalEOS](https://caleos.io) and Project Direction: Kersten Wirth) and further resources of the Telos Block Providers [Persiantelos](https://persiantelos.com) and [nodenode](https://www.nodenode.org) (Lead by Rami James who is recognized for his UX/UI work for the
signer and wallet [Scatter](https://github.com/GetScatter)).

This project's aim is to contribute valuable code to the entire community. We are eager to accept useful pull requests, and welcome users and developers alike to submit feature requests and bug reports. While the first iterations are driven by the Telos Core Developers team, we are welcoming _anybody_ who wishes to contribute and actively develop this open source solution for the AntelopeIO ecosystem!

## Functional reference products

AntelopeIO based chains require specific components, of which various are historically managed within the various block explorers.

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
- [AJOR](https://ajor.io/)

## Recent Contributions

![Alt](https://repobeats.axiom.co/api/embed/941f4d4cdc848b95f1ae663fadd142bdda4499f3.svg "Repobeats analytics image")

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

It is recommended to use Node version 14 if you experience issues running the application with other versions.

Using nvm: `nvm use 14`

### Clone repo
```bash
git clone https://github.com/telosnetwork/open-block-explorer
```

### Install the dependencies

```bash
cd open-block-explorer && yarn
```

### Restore .env file, set default chain and/or optionally enable chain switching
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



