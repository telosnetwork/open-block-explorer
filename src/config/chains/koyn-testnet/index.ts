/*
# MAINNET VALUES
# NETWORK_CHAIN_ID=4667b205c6838ef70ff7988f6e8257e8be0e1284a2f59699054a018f743b1d11
# NETWORK_HOST=telos.caleos.io
# NETWORK_PORT=443
# NETWORK_PROTOCOL=https
# NETWORK_EVM_RPC=https://mainnet.telos.net/evm
# NETWORK_EVM_ENDPOINT=https://mainnet.telos.net
# NETWORK_EVM_CONTRACT=eosio.evm
# NETWORK_EVM_CHAIN_ID=40
# HYPERION_ENDPOINT=https://telos.caleos.io
# TELOS_API_ENDPOINT=https://api.telos.net/v1
 */

import BaseChain, { baseUiConfiguration } from 'src/config/BaseChain';
import { RpcEndpoint } from 'universal-authenticator-library';
import { getEmptyPriceChartData } from 'src/api/price';
import { PriceChartData } from 'src/types/PriceChartData';
import { Theme } from 'src/types/Theme';
import { Token } from 'src/types';
import { UiCustomization } from 'src/types/UiCustomization';
const CHAIN_ID =
  '2081223fcffc96ce2d22ab63df414d1d6bf2f64f2e2922d500808decacd8b8b';
const NAME = 'koyn-testnet';
const DISPLAY = 'Koyn';
const TOKEN = {
    symbol: 'KOYN',
    precision: 4,
    amount: 0,
    contract: 'eosio.token',
} as Token;
const HYPERION_ENDPOINT = 'https://hyptest.koy.network';
const RPC_ENDPOINT = {
    protocol: 'https',
    host: 'testnet.koyn.goodblock.io',
    port: 443,
};
const FUEL_RPC_ENDPOINT = {
    protocol: 'https',
    host: 'testnet.koyn.goodblock.io',
    port: 443,
};
const API_ENDPOINT = 'https://testnet.koyn.goodblock.io/v1';
const S3_PRODUCER_BUCKET = '';
const DISPLAY_MAP = false;
const THEME = {
    primary: '#CE1C61',
    secondary: '#82103C',
    accent: '#EE05F2',
    dark: '#1D1D1D',
    positive: '#21BA45',
    negative: '#FF0000',
    info: '#90B862',
    warning: '#FFBB69',
    'color-map': '#CE1C61',
    'color-primary-gradient': 'linear-gradient(90deg, #82103C 65%, #492030 100%)',
    'color-secondary-gradient':
    'linear-gradient(180deg, #82103C 20%, #5492030 85%)',
    'color-tertiary-gradient':
    'linear-gradient(90deg, #82103C 35%, #82103C 65%)',
    'color-progress-gradient':
    'linear-gradient(90deg, #82103C 10%, #CBCAF5 75%)',
    'color-producer-card-background': '#F5F4FE',
    'color-select-box-background': '#E0DFFB',
    'color-separator-background': 'rgba(138, 101, 212, 0.1)',
    'color-header-background': '#82103C',
    'color-header-border': '#710E34',
    'color-header-support-background': 'linear-gradient(180deg, #82103C 20%, #542030 85%)',
    'color-graph-shadow': '#CE1C6128',
    'color-footer-background': '#492030',
};
export default class KoynTestnet extends BaseChain {
    getName(): string {
        return NAME;
    }
    getChainId(): string {
        return CHAIN_ID;
    }
    getDisplay(): string {
        return DISPLAY;
    }
    getHyperionEndpoint(): string {
        return HYPERION_ENDPOINT;
    }
    getRPCEndpoint(): RpcEndpoint {
        return RPC_ENDPOINT;
    }
    getFuelRPCEndpoint(): RpcEndpoint | null {
        return FUEL_RPC_ENDPOINT;
    }
    getApiEndpoint(): string {
        return API_ENDPOINT;
    }
    getS3ProducerBucket(): string {
        return S3_PRODUCER_BUCKET;
    }
    getPriceData(): Promise<PriceChartData> {
        return getEmptyPriceChartData();
    }
    getSystemToken(): Token {
        return TOKEN;
    }
    getUsdPrice(): Promise<number> {
        return Promise.resolve(0);
    }
    getLargeLogoPath(): string {
        return 'chains/koyn-testnet/koyn_logo.svg';
    }
    getSmallLogoPath(): string {
        return 'chains/koyn-testnet/koyn.png';
    }
    getMapDisplay(): boolean {
        return DISPLAY_MAP;
    }
    getTheme(): Theme {
        return THEME;
    }

    getUiCustomization(): UiCustomization {
        return {
            ...baseUiConfiguration,
            footerLinks: [
                { label: 'PRIVACY', url: 'https://koy.network/privacy-policy' },
            ],
            headerSettings: {
                hideLoginHandler: true,

                hideNetworkTab: true,
                hideWalletTab: true,
                hideVoteTab: true,
                hideProposalTab: true,
            },
            accountPageSettings: {
                hideCpuInfo: true,
                hideNetInfo: true,
                hideRamInfo: true,
                hideRexInfo: true,
                hideRefundingInfo: true,
                hideDelegatedInfo: true,

                hideResourcesControl: true,
                hideRexControl: true,

                hideTransactionTab: false,
                hideTokensTab: true,
                hideKeysTab: false,
                hideChildrenTab: true,
                hideContractsTab: false,
            },
        };
    }

    getFiltersSupported(prop: string): boolean {
        if (prop === 'notified') {
            return true;
        }
        return true;
    }
    isTestnet(): boolean {
        return true;
    }
}
