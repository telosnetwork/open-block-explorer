import { boot } from 'quasar/wrappers';
import { useNetworksStore } from 'src/stores/networks';

export default boot(({  }) => {
    const networksStore = useNetworksStore();
    networksStore.setupNetworks();
});
