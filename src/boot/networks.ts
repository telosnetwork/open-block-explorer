import { boot } from 'quasar/wrappers';
import { useNetworksStore } from 'src/stores/networks';

export default boot(async ({  }) => {
    const networksStore = useNetworksStore();
    await networksStore.setupNetworks();
});
