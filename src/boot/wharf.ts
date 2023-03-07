import { boot } from 'quasar/wrappers';
import { Chain } from 'src/types/Chain';
import { getChain } from 'src/config/ConfigManager';
import { BrowserLocalStorage, Session, SessionKit } from '@wharfkit/session';
import { WalletPluginMock } from '@wharfkit/wallet-plugin-mock';

const chain: Chain = getChain();

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $kit: SessionKit;
    $user: Session;
  }
}

export default boot(({ app }) => {
    const kit = new SessionKit({
        appName: process.env.APP_NAME,
        chains: [
            {
                id: chain.getChainId(),
                url: String(chain.getRPCEndpoint()),
            },
        ],
        storage: new BrowserLocalStorage('obe'),
        walletPlugins: [new WalletPluginMock()],
    });
    app.config.globalProperties.$kit = kit;
});
