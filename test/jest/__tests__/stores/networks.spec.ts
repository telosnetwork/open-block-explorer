import { createPinia, setActivePinia } from 'pinia';
import { useNetworksStore } from 'src/stores/networks';

describe('Networks Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    afterEach(() => {
        const networksStore = useNetworksStore();
        networksStore.currentNetworkName = '';
        networksStore.preferredNetworkName = '';
    });

    describe('setupNetworks', () => {
        it('sets supported networks', () => {
            const networksStore = useNetworksStore();

            expect(networksStore.networks.length).toBe(0);
            expect(networksStore.currentNetworkName).toBe('');
            expect(networksStore.preferredNetworkName).toBe('');

            networksStore.setupNetworks();

            expect(networksStore.networks.length).toBe(2);
            expect(networksStore.currentNetworkName).toBe('');
            expect(networksStore.preferredNetworkName).toBe('');
        });

        it('sets supported networks and applies preferred network', () => {
            const networksStore = useNetworksStore();
            networksStore.preferredNetworkName = 'telos';

            const updateCurrentNetwork = jest.spyOn(networksStore, 'updateCurrentNetwork');

            expect(networksStore.networks.length).toBe(0);
            expect(networksStore.currentNetworkName).toBe('');
            expect(networksStore.preferredNetworkName).toBe('telos');

            networksStore.setupNetworks();

            expect(networksStore.networks.length).toBe(2);
            expect(updateCurrentNetwork).toBeCalledWith('telos');
            expect(networksStore.currentNetworkName).toBe('telos');
            expect(networksStore.preferredNetworkName).toBe('telos');
        });

        it('sets supported networks and applies current network', () => {
            const networksStore = useNetworksStore();
            networksStore.currentNetworkName = 'telos';

            const updateCurrentNetwork = jest.spyOn(networksStore, 'updateCurrentNetwork');

            expect(networksStore.networks.length).toBe(0);
            expect(networksStore.currentNetworkName).toBe('telos');
            expect(networksStore.preferredNetworkName).toBe('');

            networksStore.setupNetworks();

            expect(networksStore.networks.length).toBe(2);
            expect(updateCurrentNetwork).toBeCalledWith('telos');
            expect(networksStore.currentNetworkName).toBe('telos');
            expect(networksStore.preferredNetworkName).toBe('');
        });
    });

    describe('updateCurrentNetwork', () => {
        it('updates when network is supported', () => {
            const networksStore = useNetworksStore();

            expect(networksStore.networks.length).toBe(0);
            expect(networksStore.currentNetworkName).toBe('');
            expect(networksStore.preferredNetworkName).toBe('');

            networksStore.setupNetworks();
            networksStore.updateCurrentNetwork('telos');

            expect(networksStore.networks.length).toBe(2);
            expect(networksStore.currentNetworkName).toBe('telos');
            expect(networksStore.preferredNetworkName).toBe('');
        });

        it('does not update when network is not supported', () => {
            const networksStore = useNetworksStore();

            expect(networksStore.networks.length).toBe(0);
            expect(networksStore.currentNetworkName).toBe('');
            expect(networksStore.preferredNetworkName).toBe('');

            networksStore.setupNetworks();
            networksStore.updateCurrentNetwork('unsupported');

            expect(networksStore.networks.length).toBe(2);
            expect(networksStore.currentNetworkName).toBe('');
            expect(networksStore.preferredNetworkName).toBe('');
        });
    });

    describe('updatePreferredNetwork', () => {
        it('updates when network is supported', () => {
            const networksStore = useNetworksStore();

            expect(networksStore.networks.length).toBe(0);
            expect(networksStore.currentNetworkName).toBe('');
            expect(networksStore.preferredNetworkName).toBe('');

            networksStore.setupNetworks();
            networksStore.updatePreferredNetwork('telos');

            expect(networksStore.networks.length).toBe(2);
            expect(networksStore.currentNetworkName).toBe('');
            expect(networksStore.preferredNetworkName).toBe('telos');
        });

        it('does not update when network is not supported', () => {
            const networksStore = useNetworksStore();

            expect(networksStore.networks.length).toBe(0);
            expect(networksStore.currentNetworkName).toBe('');
            expect(networksStore.preferredNetworkName).toBe('');

            networksStore.setupNetworks();
            networksStore.updatePreferredNetwork('unsupported');

            expect(networksStore.networks.length).toBe(2);
            expect(networksStore.currentNetworkName).toBe('');
            expect(networksStore.preferredNetworkName).toBe('');
        });
    });

    describe('isNetworkSupported', () => {
        it('returns true for supported network', () => {
            const networksStore = useNetworksStore();

            expect(networksStore.networks.length).toBe(0);
            expect(networksStore.currentNetworkName).toBe('');
            expect(networksStore.preferredNetworkName).toBe('');

            networksStore.setupNetworks();
            const result = networksStore.isNetworkSupported('telos');

            expect(networksStore.networks.length).toBe(2);
            expect(networksStore.currentNetworkName).toBe('');
            expect(networksStore.preferredNetworkName).toBe('');
            expect(result).toBe(true);
        });

        it('returns false for unsupported networks', () => {
            const networksStore = useNetworksStore();

            expect(networksStore.networks.length).toBe(0);
            expect(networksStore.currentNetworkName).toBe('');
            expect(networksStore.preferredNetworkName).toBe('');

            networksStore.setupNetworks();
            const result = networksStore.isNetworkSupported('unsupported');

            expect(networksStore.networks.length).toBe(2);
            expect(networksStore.currentNetworkName).toBe('');
            expect(networksStore.preferredNetworkName).toBe('');
            expect(result).toBe(false);
        });
    });
});

