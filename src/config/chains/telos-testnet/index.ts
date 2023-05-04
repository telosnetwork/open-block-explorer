/*
NETWORK_CHAIN_ID=
NETWORK_HOST=testnet.telos.caleos.io
NETWORK_PORT=443
NETWORK_PROTOCOL=https
NETWORK_EVM_RPC=https://testnet.telos.net/evm
NETWORK_EVM_ENDPOINT=https://testnet.telos.caleos.io
NETWORK_EVM_CONTRACT=eosio.evm
NETWORK_EVM_CHAIN_ID=41
HYPERION_ENDPOINT=https://testnet.telos.caleos.io
TELOS_API_ENDPOINT=https://api-dev.telos.net/v1

# TELOS_API_ENDPOINT=localhost:9999/v1
APP_NAME=OBE
PRODUCER_BUCKET_URL=

 */

import BaseChain from 'src/config/BaseChain';
import { RpcEndpoint } from 'universal-authenticator-library';
import { PriceChartData } from 'src/types/PriceChartData';
import { getEmptyPriceChartData } from 'src/api/price';
import { Theme } from 'src/types/Theme';
import { Token } from 'src/types';

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
const RPC_ENDPOINT = {
    protocol: 'https',
    host: 'testnet.telos.net',
    port: 443,
};
const API_ENDPOINT = 'https://api-dev.telos.net/v1';
const DISPLAY_MAP = false;
const THEME = {
    primary: '#571aff',
    secondary: '#071A5F',
    accent: '#9C27B0',
    dark: '#1d1d1d',
    positive: '#21BA45',
    negative: '#ff0000',
    info: '#31CCEC',
    warning: '#F2C037',
    'color-map': '#4325c2',
    'color-primary-gradient': 'linear-gradient(90deg, #071A5F 0%, #571AFF 100%)',
    'color-secondary-gradient':
    'linear-gradient(180deg, #071A5F 0%, #571aff 147.34%)',
    'color-tertiary-gradient':
    'linear-gradient(90deg, #CBCAF5 0%, #A9CAF3 56.77%, #63C9EF 100%)',
    'color-progress-gradient':
    'linear-gradient(90deg, #571AFF 0%, #A088F9 48.44%, #CBCAF5 100%)',
    'color-producer-card-background': '#f5f4fe',
    'color-select-box-background': '#e0dffb',
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

    getRPCEndpoint(): RpcEndpoint {
        return RPC_ENDPOINT;
    }

    getFuelRPCEndpoint(): RpcEndpoint | null {
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
        return 'chains/telos/telos_logo.svg';
    }

    getSmallLogoPath(): string {
        return 'chains/telos/tlos.png';
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
}
