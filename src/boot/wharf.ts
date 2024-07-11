import { Session, SessionKit } from '@wharfkit/session';
import { TransactPluginResourceProvider } from '@wharfkit/transact-plugin-resource-provider';
import { WalletPluginAnchor } from '@wharfkit/wallet-plugin-anchor';
import { WalletPluginCleos } from '@wharfkit/wallet-plugin-cleos';
import { WalletPluginPrivateKey } from '@wharfkit/wallet-plugin-privatekey';
import WebRenderer from '@wharfkit/web-renderer';
import { boot } from 'quasar/wrappers';
import { getChain } from 'src/config/ConfigManager';
import { Chain } from 'src/types/Chain';

const chain: Chain = getChain();

declare module 'vue' {
  interface ComponentCustomProperties {
    $kit: SessionKit;
    $user: Session;
  }
}

export const ui = new WebRenderer();

export const kit = new SessionKit({
    appName: process.env.APP_NAME,
    chains: [
        {
            id: chain.getChainId(),
            url: String(chain.getRPCEndpoint()),
        },
    ],
    ui,
    walletPlugins: [
        new WalletPluginAnchor(),
        new WalletPluginCleos(),
        new WalletPluginPrivateKey('5Jtoxgny5tT7NiNFp1MLogviuPJ9NniWjnU4wKzaX4t7pL4kJ8s'),
    ],
},
{
    transactPlugins: [
        new TransactPluginResourceProvider(),
    ],
});

export default boot(({ app }) => {
    app.config.globalProperties.$kit = kit;
});
