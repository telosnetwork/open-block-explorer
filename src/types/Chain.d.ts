import { RpcEndpoint } from 'universal-authenticator-library';

export interface Chain {
  getName(): string;
  getDisplay(): string;
  getChainId(): string;
  getRPCEndpoint(): RpcEndpoint;
  getHyperionEndpoint(): string;
  getS3ProducerBucket(): string;
}
