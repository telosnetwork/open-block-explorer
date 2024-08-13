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
  'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906';
const NAME = 'eos';
const DISPLAY = 'EOS';
const TOKEN = {
    symbol: 'EOS',
    precision: 4,
    amount: 0,
    contract: 'eosio.token',
} as Token;
const HYPERION_ENDPOINT = 'https://eos.eosusa.io';
const RPC_ENDPOINT = 'https://eos.eosusa.io';
const FUEL_RPC_ENDPOINT = 'https://eos.greymass.com';
const API_ENDPOINT = 'https://eos.greymass.com';
const S3_PRODUCER_BUCKET = 'https://telos-producer-validation.s3.amazonaws.com';
const DISPLAY_MAP = false;
const THEME = {
    primary: '#28417c',
    secondary: '#000000', //disso
    accent: '#9C27B0',
    dark: '#1d1d1d',
    positive: '#21BA45',
    negative: '#ff0000',
    info: '#31CCEC',
    warning: '#F2C037',
    'color-map': '#19284e', //disso
    'color-primary-gradient': 'linear-gradient(90deg, #0c3964 0%, #1876d2 100%)',
    'color-secondary-gradient':
    'linear-gradient(180deg, #0c3964 0%, #1876d2 147.34%)',
    'color-tertiary-gradient':
    'linear-gradient(90deg, #CBCAF5 0%, #A9CAF3 56.77%, #63C9EF 100%)',
    'color-progress-gradient': '#28417c',
    'color-header-background': '#000000',
    'color-header-border': '#444',
    'color-header-support-background': '#000',
    'color-graph-shadow': '#3f65c228',
    'color-footer-background': '#000000',
};

// create vars for map colors (border, background, countries, popup, text, popup)

export default class EOS extends BaseChain {
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
        return getCoingeckoPriceChartData('eos');
    }

    getSystemToken(): Token {
        return TOKEN;
    }

    getUsdPrice(): Promise<number> {
        return getCoingeckoUsdPrice('eos');
    }

    getLargeLogoPath(): string {
        return 'chains/eos/eos_large.png';
    }

    getSmallLogoPath(): string {
        return 'chains/eos/eos.png';
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
            { label: 'TERMS', url: 'https://eosnetwork.com/terms-of-use/' },
            { label: 'PRIVACY', url: 'https://eosnetwork.com/privacy-policy/' },
            { label: 'REPOSITORY', url: 'https://github.com/telosnetwork/open-block-explorer' },
        ];
    }

    getFathomSiteId(): string | null {
        return null;
    }
}
