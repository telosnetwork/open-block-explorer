import { UAL } from 'universal-authenticator-library';
import { Anchor } from 'ual-anchor';

export const ual = function (): UAL {
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
    new Anchor([mainChain], { appName: process.env.APP_NAME })
  ];

  return new UAL([mainChain], 'ual', authenticators);
};
