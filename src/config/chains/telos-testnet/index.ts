/*
NETWORK_CHAIN_ID=
NETWORK_HOST=testnet.telos.net
NETWORK_PORT=443
NETWORK_PROTOCOL=https
NETWORK_EVM_RPC=https://testnet.telos.net/evm
NETWORK_EVM_ENDPOINT=https://testnet.telos.net
NETWORK_EVM_CONTRACT=eosio.evm
NETWORK_EVM_CHAIN_ID=41
HYPERION_ENDPOINT=https://testnet.telos.net
TELOS_API_ENDPOINT=https://api-dev.telos.net/v1

# TELOS_API_ENDPOINT=localhost:9999/v1
APP_NAME=OBE
PRODUCER_BUCKET_URL=

 */

import { getEmptyPriceChartData } from 'src/api/price';
import BaseChain from 'src/config/BaseChain';
import { Token } from 'src/types';
import { PriceChartData } from 'src/types/PriceChartData';
import { Theme } from 'src/types/Theme';
import { FooterLink } from 'src/types/UiCustomization';

const CHAIN_ID =
  '1eaa0824707c8c16bd25145493bf062aecddfeb56c736f6ba6397f3195f33c9f';
const NAME = 'telos-testnet';
const DISPLAY = 'Telos';
const TOKEN = {
    symbol: 'TLOS',
    precision: 4,
    amount: 0,
    contract: 'eosio.token',
} as Token;
const HYPERION_ENDPOINT = 'https://testnet.telos.net';
const S3_PRODUCER_BUCKET = 'https://telos-producer-validation.s3.amazonaws.com';
const RPC_ENDPOINT = 'https://testnet.telos.net';
const API_ENDPOINT = 'https://api-dev.telos.net/v1';
const DISPLAY_MAP = false;
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

export default class TelosTestnet extends BaseChain {
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
        return null;
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
        return 'chains/telos-testnet/telos_logo.svg';
    }

    getSmallLogoPath(): string {
        return 'chains/telos-testnet/telos_icon.svg';
    }

    getMapDisplay(): boolean {
        return DISPLAY_MAP;
    }

    getTheme(): Theme {
        return THEME;
    }

    getFiltersSupported(prop: string): boolean {
        if (prop === 'notified') {
            return false;
        }
        return true;
    }

    isTestnet(): boolean {
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
        return 'HKAXCRJB';
    }

}
