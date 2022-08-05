/*
# MAINNET VALUES
# NETWORK_CHAIN_ID=4667b205c6838ef70ff7988f6e8257e8be0e1284a2f59699054a018f743b1d11
# NETWORK_HOST=telos.caleos.io
# NETWORK_PORT=443
# NETWORK_PROTOCOL=https
# NETWORK_EVM_RPC=https://mainnet.telos.net/evm
# NETWORK_EVM_ENDPOINT=https://mainnet.telos.net
# NETWORK_EVM_CONTRACT=eosio.evm
# NETWORK_EVM_CHAIN_ID=40
# HYPERION_ENDPOINT=https://telos.caleos.io
# TELOS_API_ENDPOINT=http://app.telos.net

 */

import BaseChain from '../../BaseChain';
import { RpcEndpoint } from 'universal-authenticator-library';
import {
  getCoingeckoPriceChartData,
  getCoingeckoUsdPrice
} from 'src/api/price';
import { PriceChartData } from 'src/types/PriceChartData';

const CHAIN_ID =
  '4667b205c6838ef70ff7988f6e8257e8be0e1284a2f59699054a018f743b1d11';
const DISPLAY = 'Telos';
const SYMBOL = 'TLOS';
const HYPERION_ENDPOINT = 'https://mainnet.telos.net';

const RPC_ENDPOINT = {
  protocol: 'https',
  host: 'mainnet.telos.net',
  port: 443
};
const S3_PRODUCER_BUCKET = 'https://telos-producer-validation.s3.amazonaws.com';
const DISPLAY_MAP = true;

export default class Telos extends BaseChain {
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
    return getCoingeckoPriceChartData('telos');
  }

  getSymbol(): string {
    return SYMBOL;
  }

  getUsdPrice(): Promise<number> {
    return getCoingeckoUsdPrice('telos');
  }

  getLargeLogoPath(): string {
    return 'chains/telos/telos_logo.svg';
  }

  getSmallLogoPath(): string {
    return 'chains/telos/tlos.png';
  }

  getMapDisplay(): boolean {
    return DISPLAY_MAP;
  }
}
