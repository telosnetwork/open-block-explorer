import axios from 'axios';
import { addInterceptors } from 'src/api/axiosInterceptors';
import { useNetworksStore } from 'src/stores/networks';

const networksStore = useNetworksStore();
const networkEndpoint = networksStore.getCurrentNetwork.getNetworkEndpoint();

const telosApi = axios.create({ baseURL: networkEndpoint });
addInterceptors(telosApi);

export const getApy = async function (): Promise<string> {
    try {
        const response = await telosApi.get('v1/apy/native');
        return response.data as string;
    } catch (e) {
        console.error('Error on apy/native', e);
    }
};
