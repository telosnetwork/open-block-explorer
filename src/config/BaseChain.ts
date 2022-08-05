import { Chain } from '../types/Chain';
import { RpcEndpoint } from 'universal-authenticator-library';
import { PriceChartData } from 'src/types/PriceChartData';

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

  abstract getSymbol(): string;
  abstract getChainId(): string;
  abstract getDisplay(): string;
  abstract getHyperionEndpoint(): string;
  abstract getRPCEndpoint(): RpcEndpoint;
  abstract getS3ProducerBucket(): string;
  abstract getPriceData(): Promise<PriceChartData>;
  abstract getUsdPrice(): Promise<number>;
  abstract getMapDisplay(): boolean;
}
