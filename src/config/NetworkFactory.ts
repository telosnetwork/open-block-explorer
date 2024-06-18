import EOS from 'src/config/chains/eos';
import Telos from 'src/config/chains/telos';
import UX from 'src/config/chains/ux';
import Wax from 'src/config/chains/wax';

import Jungle from 'src/config/chains/jungle';
import TelosTestnet from 'src/config/chains/telos-testnet';
import WaxTestnet from 'src/config/chains/wax-testnet';

import { Chain } from 'src/types/Chain';

// TODO: turn these classes into functions and remove name parameter
export const createNetwork = (name: string): Chain => {
    switch (name) {
    case 'eos':
        return new EOS('eos');
    case 'telos':
        return new Telos('telos');
    case 'ux':
        return new UX('ux');
    case 'wax':
        return new Wax('wax');
    case 'jungle':
        return new Jungle('jungle');
    case 'telos-testnet':
        return new TelosTestnet('telos-testnet');
    case 'wax-testnet':
        return new WaxTestnet('wax-testnet');
    default:
        console.error(`Network ${name} not supported`);
    }
};
