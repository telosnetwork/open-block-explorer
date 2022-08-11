import { UAL } from 'universal-authenticator-library';
import { Anchor } from 'ual-anchor';
import { Chain } from 'src/types/Chain';
import { getChain } from 'src/config/ConfigManager';

const chain: Chain = getChain();

export const ual = function (): UAL {
  const mainChain = {
    chainId: chain.getChainId(),
    rpcEndpoints: [chain.getRPCEndpoint()]
  };

  const authenticators = [
    new Anchor([mainChain], { appName: process.env.APP_NAME })
  ];

  return new UAL([mainChain], 'ual', authenticators);
};
