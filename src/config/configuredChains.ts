import Telos from './chains/telos';
import TelosTestnet from './chains/telos-testnet';
import { ChainsConfig } from 'src/types/ChainsConfig';

const chains: ChainsConfig = {
  mainnets: [new Telos('telos')],
  testnets: [new TelosTestnet('telos-testnet')]
};

export default chains;
