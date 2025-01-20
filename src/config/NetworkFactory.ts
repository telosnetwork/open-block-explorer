import EOS from 'src/config/chains/eos';
import Telos from 'src/config/chains/telos';
import UX from 'src/config/chains/ux';
import Wax from 'src/config/chains/wax';

import Jungle from 'src/config/chains/jungle';
import TelosTestnet from 'src/config/chains/telos-testnet';

import { Chain } from 'src/types/Chain';

export const createNetwork = (name: string): Chain => {
    switch (name) {
    case 'eos':
        return new EOS();
    case 'telos':
        return new Telos();
    case 'ux':
        return new UX();
    case 'wax':
        return new Wax();
    case 'jungle':
        return new Jungle();
    case 'telos-testnet':
        return new TelosTestnet();
    default:
        console.error(`Network ${name} not supported`);
    }
};
