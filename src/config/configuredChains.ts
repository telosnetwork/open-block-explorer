import EOS from './chains/eos';
import Telos from './chains/telos';
import UX from './chains/ux';
import Wax from './chains/wax';

import TelosTestnet from './chains/telos-testnet';
import Jungle from './chains/jungle';

import { ChainsConfig } from 'src/types/ChainsConfig';

const chains: ChainsConfig = {
  mainnets: [new EOS('eos'), new Telos('telos'), new UX('ux'), new Wax('wax')],
  testnets: [new Jungle('jungle'), new TelosTestnet('telos-testnet')],
};

export default chains;
