import { SessionKit } from '@wharfkit/session';
import { TransactPluginResourceProvider } from '@wharfkit/transact-plugin-resource-provider';
import { WalletPluginAnchor } from '@wharfkit/wallet-plugin-anchor';
import { WalletPluginCleos } from '@wharfkit/wallet-plugin-cleos';
import { WalletPluginPrivateKey } from '@wharfkit/wallet-plugin-privatekey';
import WebRenderer from '@wharfkit/web-renderer';
import { useNetworksStore } from 'src/stores/networks';

const networksStore = useNetworksStore();

export const ui = new WebRenderer();

export const kit = new SessionKit({
    appName: process.env.APP_NAME,
    chains: [
        {
            id: networksStore.getCurrentNetwork.getChainId(),
            url: String(networksStore.getCurrentNetwork.getV1Endpoint()),
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

