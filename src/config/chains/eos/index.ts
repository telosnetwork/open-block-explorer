import BaseChain from '../../BaseChain';
import { RpcEndpoint } from 'universal-authenticator-library';
import {
  getCoingeckoPriceChartData,
  getCoingeckoUsdPrice
} from 'src/api/price';
import { PriceChartData } from 'src/types/PriceChartData';
import { Theme } from 'src/types/Theme';

const CHAIN_ID =
  'aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906';
const DISPLAY = 'EOS';
const SYMBOL = 'EOS';
const HYPERION_ENDPOINT = 'https://api.eossweden.org';

const RPC_ENDPOINT = {
  protocol: 'https',
  host: 'api.eossweden.org',
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
    return getCoingeckoPriceChartData('eos');
  }

  getSymbol(): string {
    return SYMBOL;
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
}
