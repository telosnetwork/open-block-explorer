import Koyn from 'src/config/chains/koyn';
import KoynTestnet from 'src/config/chains/koyn-testnet';

import { ChainsConfig } from 'src/types/ChainsConfig';

const chains: ChainsConfig = {
    mainnets: [new Koyn('koyn')],
    testnets: [new KoynTestnet('koyn-testnet')],
};

export default chains;
