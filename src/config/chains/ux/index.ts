import { getEmptyPriceChartData } from 'src/api/price';
import BaseChain from 'src/config/BaseChain';
import { Token } from 'src/types';
import { PriceChartData } from 'src/types/PriceChartData';
import { Theme } from 'src/types/Theme';
import { FooterLink } from 'src/types/UiCustomization';

const CHAIN_ID =
  '8fc6dce7942189f842170de953932b1f66693ad3788f766e777b6f9d22335c02';
const NAME = 'ux';
const DISPLAY = 'UX';
const TOKEN = {
    symbol: 'UTX',
    precision: 4,
    amount: 0,
    contract: 'eosio.token',
} as Token;
const HYPERION_ENDPOINT = 'https://ux.eosusa.io';
const V1_ENDPOINT = 'https://ux.eosusa.io';
const S3_PRODUCER_BUCKET = 'https://telos-producer-validation.s3.amazonaws.com';
const DISPLAY_MAP = false;
const THEME = {};

export default class UX extends BaseChain {
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

    getV1Endpoint(): string {
        return V1_ENDPOINT;
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
        return 'chains/ux/logo_sm.png';
    }

    getSmallLogoPath(): string {
        return 'chains/ux/logo_sm.png';
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

    getFooterLinks(): FooterLink[] {
        return [
            { label: 'TERMS', url: 'https://uxnetwork.io/static/Terms.pdf' },
            { label: 'PRIVACY', url: 'https://uxnetwork.io/static/PP.pdf' },
            { label: 'REPOSITORY', url: 'https://github.com/telosnetwork/open-block-explorer' },
        ];
    }

    getFathomSiteId(): string | null {
        return null;
    }

}
