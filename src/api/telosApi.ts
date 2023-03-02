import axios from 'axios';
import { Chain } from 'src/types/Chain';
import { getChain } from 'src/config/ConfigManager';

const MAX_REQUESTS_COUNT = 5;
const INTERVAL_MS = 10;
let PENDING_REQUESTS = 0;

const chain: Chain = getChain();

const telosApi = axios.create({ baseURL: chain.getApiEndpoint() });

telosApi.interceptors.request.use(function (config) {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            if (PENDING_REQUESTS < MAX_REQUESTS_COUNT) {
                PENDING_REQUESTS++;
                clearInterval(interval);
                resolve(config);
            }
        }, INTERVAL_MS);
    });
});

/**
 * Axios Response Interceptor
 */
telosApi.interceptors.response.use(
    function (response) {
        PENDING_REQUESTS = Math.max(0, PENDING_REQUESTS - 1);
        return Promise.resolve(response);
    },
    function (error) {
        PENDING_REQUESTS = Math.max(0, PENDING_REQUESTS - 1);
        return Promise.reject(error);
    },
);

export const getApy = async function (): Promise<string> {
    const response = await telosApi.get('apy/native');
    return response.data as string;
};
