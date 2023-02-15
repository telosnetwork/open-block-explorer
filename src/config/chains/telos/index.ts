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

import BaseChain from '../../BaseChain';
import { RpcEndpoint } from 'universal-authenticator-library';
import {
    getCoingeckoPriceChartData,
    getCoingeckoUsdPrice,
} from 'src/api/price';
import { PriceChartData } from 'src/types/PriceChartData';
import { Theme } from 'src/types/Theme';
import { Token } from 'src/types';

const CHAIN_ID =
  '4667b205c6838ef70ff7988f6e8257e8be0e1284a2f59699054a018f743b1d11';
const DISPLAY = 'Telos';
const TOKEN = {
    symbol: 'TLOS',
    precision: 4,
    amount: 0,
    contract: 'eosio.token',
} as Token;

const HYPERION_ENDPOINT = 'https://mainnet.telos.net';

const RPC_ENDPOINT = {
    protocol: 'https',
    host: 'mainnet.telos.net',
    port: 443,
};
const FUEL_RPC_ENDPOINT = {
    protocol: 'https',
    host: 'telos.greymass.com',
    port: 443,
};
const API_ENDPOINT = 'https://api.telos.net/v1';
const S3_PRODUCER_BUCKET = 'https://telos-producer-validation.s3.amazonaws.com';
const DISPLAY_MAP = true;
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

export default class Telos extends BaseChain {
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
        return 'chains/telos/tlos.png';
    }

    getMapDisplay(): boolean {
        return DISPLAY_MAP;
    }

    getTheme(): Theme {
        return THEME;
    }
}
