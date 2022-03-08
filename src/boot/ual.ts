import { boot } from 'quasar/wrappers';
import { UAL } from 'universal-authenticator-library';
import { EOSIOAuth } from 'ual-eosio-reference-authenticator';
import { KeycatAuthenticator } from '@telosnetwork/ual-telos-keycat';
import { Ledger } from 'ual-ledger';
import { Scatter } from 'ual-scatter';
import { Anchor } from 'ual-anchor';
import { Wombat } from 'ual-wombat';

export default boot(({ app }) => {
  const mainChain = {
    chainId: process.env.NETWORK_CHAIN_ID,
    origin: process.env.TELOS_ORIGIN,
    rpcEndpoints: [
      {
        protocol: process.env.NETWORK_PROTOCOL,
        host: process.env.NETWORK_HOST,
        port: parseInt(process.env.NETWORK_PORT)
      }
    ]
  };

  const authenticators = [
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    new KeycatAuthenticator([mainChain]),
    new Anchor([mainChain], { appName: process.env.APP_NAME }),
    new Wombat([mainChain], { appName: process.env.APP_NAME }),
    new Ledger([mainChain]),
    new Scatter([mainChain], { appName: process.env.APP_NAME }),
    new EOSIOAuth([mainChain], {
      appName: process.env.APP_NAME,
      protocol: 'eosio'
    })
  ];

  const ual = new UAL([mainChain], 'tet-ual', authenticators);
  app.config.globalProperties.$ual = ual;
});
