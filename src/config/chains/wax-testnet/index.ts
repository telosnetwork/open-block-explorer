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
  'f16b1833c747c43682f4386fca9cbb327929334a762755ebec17f6f23c9b8a12';
const NAME = 'wax-testnet';
const DISPLAY = 'WAX';
const TOKEN = {
    symbol: 'WAX',
    precision: 8,
    amount: 0,
    contract: 'eosio.token',
} as Token;
const HYPERION_ENDPOINT = '	https://test.wax.eosusa.io';
const RPC_ENDPOINT = '	https://test.wax.eosusa.io';
const API_ENDPOINT = '	https://test.wax.eosusa.io';
const S3_PRODUCER_BUCKET = 'https://telos-producer-validation.s3.amazonaws.com';
const DISPLAY_MAP = false;
const THEME = {};

export default class WaxTestnet extends BaseChain {
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
        return getCoingeckoPriceChartData('wax');
    }

    getSystemToken(): Token {
        return TOKEN;
    }

    getUsdPrice(): Promise<number> {
        return getCoingeckoUsdPrice('wax');
    }

    getLargeLogoPath(): string {
        return 'chains/wax/logo_lg.png';
    }

    getSmallLogoPath(): string {
        return 'chains/wax/logo_lg.png';
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
            { label: 'TERMS', url: 'https://www.wax.io/terms-of-service' },
            { label: 'PRIVACY', url: 'https://www.wax.io/privacy-policy' },
            { label: 'REPOSITORY', url: 'https://github.com/telosnetwork/open-block-explorer' },
        ];
    }

    getFathomSiteId(): string | null {
        return null;
    }

}
