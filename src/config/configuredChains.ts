import Telos from './chains/telos';
import EOS from './chains/eos';

import TelosTestnet from './chains/telos-testnet';
import Jungle from './chains/jungle';

import { ChainsConfig } from 'src/types/ChainsConfig';

const chains: ChainsConfig = {
  mainnets: [new EOS('eos'), new Telos('telos')],
  testnets: [new Jungle('jungle'), new TelosTestnet('telos-testnet')]
};

export default chains;
