import { boot } from 'quasar/wrappers';
import { UAL } from 'universal-authenticator-library';
import { Anchor } from 'ual-anchor';
import { Chain } from 'src/types/Chain';
import { getChain } from 'src/config/ConfigManager';

const chain: Chain = getChain();

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $ual: UAL;
  }
}

export default boot(({ app }) => {
  const mainChain = {
    chainId: chain.getChainId(),
    rpcEndpoints: [chain.getRPCEndpoint()]
  };

  const authenticators = [
    new Anchor([mainChain], { appName: process.env.APP_NAME })
  ];

  const ual = new UAL([mainChain], 'ual', authenticators);

  app.config.globalProperties.$ual = ual;
});
