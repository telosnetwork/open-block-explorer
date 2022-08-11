import BaseChain from '../../BaseChain';
import { RpcEndpoint } from 'universal-authenticator-library';
import {
  getCoingeckoPriceChartData,
  getCoingeckoUsdPrice
} from 'src/api/price';
import { PriceChartData } from 'src/types/PriceChartData';
import { Theme } from 'src/types/Theme';

const CHAIN_ID =
  '1064487b3cd1a897ce03ae5b6a865651747e2e152090f99c1d19d44e01aea5a4';
const DISPLAY = 'WAX';
const SYMBOL = 'WAX';
const HYPERION_ENDPOINT = 'https://wax.eosusa.io';

const RPC_ENDPOINT = {
  protocol: 'https',
  host: 'wax.eosusa.io',
  port: 443
};
const S3_PRODUCER_BUCKET = 'https://telos-producer-validation.s3.amazonaws.com';
const DISPLAY_MAP = true;
const THEME = {};

export default class EOS extends BaseChain {
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

  getS3ProducerBucket(): string {
    return S3_PRODUCER_BUCKET;
  }

  getPriceData(): Promise<PriceChartData> {
    return getCoingeckoPriceChartData('wax');
  }

  getSymbol(): string {
    return SYMBOL;
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
}