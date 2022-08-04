import Telos from './chains/telos';
import EOS from './chains/eos';

import TelosTestnet from './chains/telos-testnet';
import Jungle from './chains/jungle';

import { ChainsConfig } from 'src/types/ChainsConfig';

const chains: ChainsConfig = {
  mainnets: [new Telos('telos'), new EOS('eos')],
  testnets: [new TelosTestnet('telos-testnet'), new Jungle('jungle')]
};

export default chains;
