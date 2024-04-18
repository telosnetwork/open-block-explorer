import { RpcEndpoint } from 'universal-authenticator-library';
import { PriceChartData } from 'src/types/PriceChartData';
import { Theme } from 'src/types/Theme';
import { Token } from 'src/types/Actions';
import { FooterLink, UiCustomization } from 'src/types/UiCustomization';

export interface Chain {
  getName(): string;
  getSystemToken(): Token;
  getDisplay(): string;
  getSmallLogoPath(): string;
  getLargeLogoPath(): string;
  getChainId(): string;
  getRPCEndpoint(): string;
  getFuelRPCEndpoint(): RpcEndpoint | null;
  getHyperionEndpoint(): string;
  getApiEndpoint(): string;
  getS3ProducerBucket(): string;
  getPriceData(): Promise<PriceChartData>;
  getUsdPrice(): Promise<number>;
  getMapDisplay(): boolean;
  getTheme(): Theme;
  getUiCustomization(): UiCustomization;
  getFiltersSupported(prop: string): boolean;
  isTestnet(): boolean;
  getFooterLinks(): FooterLink[];
  getFathomSiteId(): string | null;
}
