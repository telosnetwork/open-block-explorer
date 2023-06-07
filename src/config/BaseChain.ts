import { Chain } from 'src/types/Chain';
import { RpcEndpoint } from 'universal-authenticator-library';
import { PriceChartData } from 'src/types/PriceChartData';
import { Theme } from 'src/types/Theme';
import { Token } from 'src/types';

export const DEFAULT_THEME = {
    primary: '#1976d2',
    secondary: '#26A69A',
    accent: '#9C27B0',
    dark: '#1d1d1d',
    'dark-page': '#121212',
    positive: '#21BA45',
    negative: '#C10015',
    info: '#31CCEC',
    warning: '#F2C037',
    'color-map': '#1976d2',
    'color-primary-gradient': 'linear-gradient(90deg, #26A69A 0%, #1976d2 100%)',
    'color-secondary-gradient': 'linear-gradient(180deg, #26A69A 0%, #1976d2 147.34%)',
    'color-tertiary-gradient': 'linear-gradient(90deg, #CBCAF5 0%, #A9CAF3 56.77%, #63C9EF 100%)',
    'color-progress-gradient': 'linear-gradient(90deg, #1976d2 0%, #A088F9 48.44%, #CBCAF5 100%)',
    'color-producer-card-background': '#f5f4fe',
    'color-select-box-background': '#e0dffb',
    'color-separator-background': 'rgba(138, 101, 212, 0.1)',
    'color-card-shadow': 'rgba(37, 42, 97, 0.3)',
    'color-dropdown-card': '#172c6c',
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
  abstract getRPCEndpoint(): RpcEndpoint;
  abstract getFuelRPCEndpoint(): RpcEndpoint | null;
  abstract getApiEndpoint(): string;
  abstract getS3ProducerBucket(): string;
  abstract getPriceData(): Promise<PriceChartData>;
  abstract getUsdPrice(): Promise<number>;
  abstract getMapDisplay(): boolean;
  abstract getTheme(): Theme;
  abstract getFiltersSupported(prop: string): boolean;

  isTestnet(): boolean {
      return false;
  }
}
