import { Token } from 'src/types';
import { Chain } from 'src/types/Chain';
import { PriceChartData } from 'src/types/PriceChartData';
import { Theme } from 'src/types/Theme';
import { FooterLink, UiCustomization } from 'src/types/UiCustomization';

// Telos brand palette — https://telos.net/branding
export const DEFAULT_THEME = {
    primary: '#0088FF',
    secondary: '#2C2B2F',
    accent: '#C471F5',
    dark: '#1B1B1D',
    'dark-page': '#121212',
    positive: '#027A48',
    negative: '#B42318',
    info: '#4FACFE',
    warning: '#F2C037',
    'color-map': '#4FACFE',
    'color-sidebar-selected': '#E6E9EC',
    'color-primary-gradient': 'linear-gradient(142deg, #00F2FE, #4FACFE 54%, #C471F5 98%)',
    'color-secondary-gradient': 'linear-gradient(180deg, #1B1B1D 0%, #2C2B2F 100%)',
    'color-tertiary-gradient': 'linear-gradient(90deg, #00F2FE 0%, #4FACFE 50%, #C471F5 100%)',
    'color-progress-gradient': 'linear-gradient(90deg, #00F2FE 0%, #4FACFE 50%, #C471F5 100%)',
    'color-producer-card-background': '#F9F9F9',
    'color-select-box-background': '#E6E9EC',
    'color-separator-background': 'rgba(79, 172, 254, 0.12)',
    'color-card-shadow': 'rgba(27, 27, 29, 0.08)',
    'color-dropdown-card': '#2C2B2F',
    'color-header-background': '#1B1B1D',
    'color-header-text': '#FFFFFF',
    'color-header-border': 'rgba(255, 255, 255, 0.08)',
    'color-header-support-background': 'linear-gradient(160deg, #1B1B1D 0%, #1E2537 55%, #35284A 100%)',
    'color-graph-shadow': '#4facfe28',
    'color-footer-background': '#1B1B1D',
};

export const baseUiConfiguration: UiCustomization = {
    headerSettings: {
        hideLoginHandler: false,

        hideNetworkTab: false,
        hideWalletTab: false,
        hideVoteTab: false,
        hideProposalTab: false,
    },
    accountPageSettings: {
        hideCpuInfo: false,
        hideNetInfo: false,
        hideRamInfo: false,
        hideRexInfo: false,
        hideRefundingInfo: false,
        hideDelegatedInfo: false,

        hideResourcesControl: false,
        hideRexControl: false,

        hideTransactionTab: false,
        hideTokensTab: false,
        hideKeysTab: false,
        hideChildrenTab: false,
        hideContractsTab: false,
    },
};

export default abstract class BaseChain implements Chain {
    protected name: string;

    constructor(name: string) {
        this.name = name;
    }

    getName(): string {
        return this.name;
    }

    getLargeLogoPath(): string {
        return `~/assets/${this.name}/logo_lg.svg`;
    }

    getSmallLogoPath(): string {
        return `~/assets/${this.name}/logo_sm.svg`;
    }

    abstract getSystemToken(): Token;
    abstract getChainId(): string;
    abstract getDisplay(): string;
    abstract getHyperionEndpoint(): string;
    abstract getRPCEndpoint(): string;
    abstract getFuelRPCEndpoint(): string | null;
    abstract getApiEndpoint(): string;
    abstract getS3ProducerBucket(): string;
    abstract getPriceData(): Promise<PriceChartData>;
    abstract getUsdPrice(): Promise<number>;
    abstract getMapDisplay(): boolean;
    abstract getTheme(): Theme;
    abstract getFooterLinks(): FooterLink[];
    abstract getFathomSiteId(): string | null;

    getUiCustomization(): UiCustomization {
        return baseUiConfiguration;
    }

    abstract getFiltersSupported(prop: string): boolean;

    isTestnet(): boolean {
        return false;
    }
}
