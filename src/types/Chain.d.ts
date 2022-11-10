import { RpcEndpoint } from 'universal-authenticator-library';
import { PriceChartData } from 'src/types/PriceChartData';
import { Theme } from 'src/types/Theme';

export interface Chain {
  getName(): string;
  getSymbol(): string;
  getDisplay(): string;
  getSmallLogoPath(): string;
  getLargeLogoPath(): string;
  getChainId(): string;
  getRPCEndpoint(): RpcEndpoint;
  getHyperionEndpoint(): string;
  getApiEndpoint(): string;
  getS3ProducerBucket(): string;
  getPriceData(): Promise<PriceChartData>;
  getUsdPrice(): Promise<number>;
  getMapDisplay(): boolean;
  getTheme(): Theme;
}
