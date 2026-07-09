/*
# MAINNET VALUES
# NETWORK_CHAIN_ID=4667b205c6838ef70ff7988f6e8257e8be0e1284a2f59699054a018f743b1d11
# NETWORK_HOST=mainnet.telos.net
# NETWORK_PORT=443
# NETWORK_PROTOCOL=https
# NETWORK_EVM_RPC=https://mainnet.telos.net/evm
# NETWORK_EVM_ENDPOINT=https://mainnet.telos.net
# NETWORK_EVM_CONTRACT=eosio.evm
# NETWORK_EVM_CHAIN_ID=40
# HYPERION_ENDPOINT=https://mainnet.telos.net
# TELOS_API_ENDPOINT=https://api.telos.net/v1

 */

import {
    getCoingeckoPriceChartData,
    getCoingeckoUsdPrice,
} from 'src/api/price';
import BaseChain from 'src/config/BaseChain';
import { Token } from 'src/types';
import { PriceChartData } from 'src/types/PriceChartData';
import { Theme } from 'src/types/Theme';
import { FooterLink } from 'src/types/UiCustomization';

const CHAIN_ID =
  '4667b205c6838ef70ff7988f6e8257e8be0e1284a2f59699054a018f743b1d11';
const NAME = 'telos';
const DISPLAY = 'Telos';
const TOKEN = {
    symbol: 'TLOS',
    precision: 4,
    amount: 0,
    contract: 'eosio.token',
} as Token;

const HYPERION_ENDPOINT = 'https://mainnet.telos.net';

const RPC_ENDPOINT = 'https://mainnet.telos.net';
const FUEL_RPC_ENDPOINT = 'https://telos.greymass.com';
const API_ENDPOINT = 'https://api.telos.net/v1';
const S3_PRODUCER_BUCKET = 'https://telos-producer-validation.s3.amazonaws.com';
const DISPLAY_MAP = true;
// Telos brand system — https://telos.net/branding
// Primary gradient: #00F2FE → #4FACFE → #C471F5; neutrals: ink #2C2B2F … grey50 #F9F9F9
const THEME = {
    primary: '#0088FF',
    secondary: '#2C2B2F',
    accent: '#C471F5',
    dark: '#1B1B1D',
    positive: '#027A48',
    negative: '#B42318',
    info: '#4FACFE',
    warning: '#F2C037',
    'color-map': '#57595F',
    'color-primary-gradient': 'linear-gradient(142deg, #00F2FE 14.14%, #4FACFE 50.81%, #C471F5 80.97%)',
    'color-secondary-gradient':
    'linear-gradient(180deg, #00F2FE 0%, #4FACFE 50%, #C471F5 147.34%)',
    'color-tertiary-gradient':
    'linear-gradient(90deg, #A5F8FF 0%, #BFE0FF 56.77%, #E9D4FC 100%)',
    'color-progress-gradient': 'linear-gradient(142deg, #00F2FE 14.14%, #4FACFE 50.81%, #C471F5 80.97%)',
    'color-producer-card-background': '#F9F9F9',
    'color-select-box-background': '#E6E9EC',
    'color-separator-background': 'rgba(44, 43, 47, 0.08)',
    'color-card-shadow': 'rgba(44, 43, 47, 0.12)',
    'color-dropdown-card': '#2C2B2F',
    'color-sidebar-selected': '#E6E9EC',
    'color-header-background': '#FFFFFF',
    'color-header-text': '#2C2B2F',
    'color-header-border': '#E6E9EC',
    'color-header-support-background': 'linear-gradient(142deg, #2C2B2F 0%, #1B1B1D 100%)',
    'color-graph-shadow': '#4facfe28',
    'color-footer-background': '#FFFFFF',
    'color-footer-text': '#2C2B2F',
};

export default class Telos extends BaseChain {
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

    getRPCEndpoint(): string {
        return RPC_ENDPOINT;
    }

    getFuelRPCEndpoint(): string | null {
        return FUEL_RPC_ENDPOINT;
    }

    getApiEndpoint(): string {
        return API_ENDPOINT;
    }

    getS3ProducerBucket(): string {
        return S3_PRODUCER_BUCKET;
    }

    getPriceData(): Promise<PriceChartData> {
        return getCoingeckoPriceChartData('telos');
    }

    getSystemToken(): Token {
        return TOKEN;
    }

    getUsdPrice(): Promise<number> {
        return getCoingeckoUsdPrice('telos');
    }

    getLargeLogoPath(): string {
        return 'chains/telos/telos_logo.svg';
    }

    getSmallLogoPath(): string {
        return 'chains/telos/telos_icon.svg';
    }

    getMapDisplay(): boolean {
        return DISPLAY_MAP;
    }

    getTheme(): Theme {
        return THEME;
    }

    getFiltersSupported(prop: string): boolean {
        if (prop === 'notified') {
            return true;
        }
        return true;
    }

    getFooterLinks(): FooterLink[] {
        return [
            { label: 'LEGAL', url: 'https://telos.net/legal' },
            { label: 'PRIVACY', url: 'https://telos.net/privacy-policy' },
            { label: 'REPOSITORY', url: 'https://github.com/telosnetwork/open-block-explorer' },
        ];
    }

    getFathomSiteId(): string | null {
        return 'VMVLEWFD';
    }

}
