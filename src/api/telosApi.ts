import axios, { AxiosInstance } from 'axios';
import { Chain } from 'src/types/Chain';
import { getChain } from 'src/config/ConfigManager';

const MAX_REQUESTS_COUNT = 5;
const INTERVAL_MS = 10;
let PENDING_REQUESTS = 0;

class TelosApi {
    static instance: TelosApi;

    static getInstance(): TelosApi {
        if (!this.instance || this.instance.chain.getName() !== getChain().getName()) {
            this.instance = new TelosApi();
        }
        return this.instance;
    }

    chain: Chain;
    api: AxiosInstance;

    constructor() {
        PENDING_REQUESTS = 0;

        this.chain = getChain();
        this.api = axios.create({ baseURL: this.chain.getApiEndpoint() });

        this.api.interceptors.request.use(function (config) {
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
        this.api.interceptors.response.use(
            function (response) {
                PENDING_REQUESTS = Math.max(0, PENDING_REQUESTS - 1);
                return Promise.resolve(response);
            },
            function (error) {
                PENDING_REQUESTS = Math.max(0, PENDING_REQUESTS - 1);
                return Promise.reject(error);
            },
        );
    }
}



export const getApy = async function (): Promise<string> {
    const telosApi = TelosApi.getInstance().api;
    const response = await telosApi.get('apy/native');
    return response.data as string;
};
