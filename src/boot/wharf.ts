import { boot } from 'quasar/wrappers';
import { Chain } from 'src/types/Chain';
import { getChain } from 'src/config/ConfigManager';
import { BrowserLocalStorage, Checksum256, PermissionLevel, Session, SessionKit } from '@wharfkit/session';
import { WalletPluginMock } from '@wharfkit/wallet-plugin-mock';
import { WalletPluginPrivateKey } from '@wharfkit/wallet-plugin-privatekey';
import WebUIRenderer from '@wharfkit/web-ui-renderer';

const chain: Chain = getChain();

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $kit: SessionKit;
    $user: Session;
  }
}

export const ui = new WebUIRenderer();

export const kit = new SessionKit({
    appName: process.env.APP_NAME,
    chains: [
        {
            id: chain.getChainId(),
            url: chain.getRPCEndpoint(),
        },
    ],
    ui,
    storage: new BrowserLocalStorage('obe'),
    walletPlugins: [
        new WalletPluginMock({
            loginResponse: {
                chain: Checksum256.from(chain.getChainId()),
                permissionLevel: PermissionLevel.from('eosio@active'),
            },
        }),
        new WalletPluginPrivateKey(
            '5Jtoxgny5tT7NiNFp1MLogviuPJ9NniWjnU4wKzaX4t7pL4kJ8s',
        ),
    ],
});

export default boot(({ app }) => {
    app.config.globalProperties.$kit = kit;
});
