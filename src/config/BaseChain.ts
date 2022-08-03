import { Chain } from '../types/Chain';
import { RpcEndpoint } from 'universal-authenticator-library';

export default abstract class BaseChain implements Chain {
  protected name: string;

  constructor(name: string) {
    this.name = name;
  }

  getName(): string {
    return this.name;
  }

  abstract getChainId(): string;

  abstract getDisplay(): string;

  abstract getHyperionEndpoint(): string;

  abstract getRPCEndpoint(): RpcEndpoint;

  abstract getS3ProducerBucket(): string;
}
