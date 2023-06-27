import EOS from 'src/config/chains/eos';
import Telos from 'src/config/chains/telos';
import UX from 'src/config/chains/ux';
import Wax from 'src/config/chains/wax';

import TelosTestnet from 'src/config/chains/telos-testnet';
import Jungle from 'src/config/chains/jungle';

import { ChainsConfig } from 'src/types/ChainsConfig';
import ChainBass from 'src/config/chains/chain-bass';

const chains: ChainsConfig = {
    mainnets: [new EOS('eos'), new Telos('telos'), new UX('ux'), new Wax('wax'), new ChainBass('chain-bass')],
    testnets: [new Jungle('jungle'), new TelosTestnet('telos-testnet')],
};

export default chains;
