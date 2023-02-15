import BaseChain from '../../BaseChain';
import { RpcEndpoint } from 'universal-authenticator-library';
import { getEmptyPriceChartData } from 'src/api/price';
import { PriceChartData } from 'src/types/PriceChartData';
import { Theme } from 'src/types/Theme';
import { Token } from 'src/types';

const CHAIN_ID =
  '8fc6dce7942189f842170de953932b1f66693ad3788f766e777b6f9d22335c02';
const DISPLAY = 'UX';
const TOKEN = {
    symbol: 'UTX',
    precision: 4,
    amount: 0,
    contract: 'eosio.token',
} as Token;
const HYPERION_ENDPOINT = 'https://ux.eosusa.io';
const RPC_ENDPOINT = {
    protocol: 'https',
    host: 'ux.eosusa.io',
    port: 443,
};
const API_ENDPOINT = 'https://example.com';
const S3_PRODUCER_BUCKET = 'https://telos-producer-validation.s3.amazonaws.com';
const DISPLAY_MAP = true;
const THEME = {};

export default class UX extends BaseChain {
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
        return 'chains/ux/logo_sm.jpeg';
    }

    getSmallLogoPath(): string {
        return 'chains/ux/logo_sm.jpeg';
    }

    getMapDisplay(): boolean {
        return DISPLAY_MAP;
    }

    getTheme(): Theme {
        return THEME;
    }
}
