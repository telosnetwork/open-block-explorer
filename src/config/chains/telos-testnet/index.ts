/*
NETWORK_CHAIN_ID=
NETWORK_HOST=testnet.telos.caleos.io
NETWORK_PORT=443
NETWORK_PROTOCOL=https
NETWORK_EVM_RPC=https://testnet.telos.net/evm
NETWORK_EVM_ENDPOINT=https://testnet.telos.caleos.io
NETWORK_EVM_CONTRACT=eosio.evm
NETWORK_EVM_CHAIN_ID=41
HYPERION_ENDPOINT=https://testnet.telos.caleos.io
TELOS_API_ENDPOINT=http://app-dev.telos.net

# TELOS_API_ENDPOINT=localhost:9999/v1
APP_NAME=OBE
PRODUCER_BUCKET_URL=

 */

import BaseChain from '../../BaseChain';
import { RpcEndpoint } from 'universal-authenticator-library';
import { PriceChartData } from 'src/types/PriceChartData';
import { getEmptyPriceChartData } from 'src/api/price';

const CHAIN_ID =
  '1eaa0824707c8c16bd25145493bf062aecddfeb56c736f6ba6397f3195f33c9f';
const DISPLAY = 'Telos testnet';
const SYMBOL = 'TLOS';
const HYPERION_ENDPOINT = 'https://testnet.telos.net';
const S3_PRODUCER_BUCKET = 'https://telos-producer-validation.s3.amazonaws.com';
const RPC_ENDPOINT = {
  protocol: 'https',
  host: 'testnet.telos.net',
  port: 443
};
export default class TelosTestnet extends BaseChain {
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
    return getEmptyPriceChartData();
  }

  getSymbol(): string {
    return SYMBOL;
  }
}
