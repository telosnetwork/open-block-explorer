import {
    AxiosError,
    AxiosInstance,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from 'axios';

const MAX_REQUESTS_COUNT = 5;
let PENDING_REQUESTS = 0;

const onRequest = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (PENDING_REQUESTS < MAX_REQUESTS_COUNT) {
        PENDING_REQUESTS++;
        return config;
    }
};

const onRequestError = (error: AxiosError): Promise<AxiosError> => {
    console.error(`[request error] [${JSON.stringify(error)}]`);
    PENDING_REQUESTS--;
    return Promise.reject(error);
};

const onResponse = (response: AxiosResponse) => {
    PENDING_REQUESTS = Math.max(0, PENDING_REQUESTS - 1);
    return response;
};

const onResponseError = (error: AxiosError) => {
    PENDING_REQUESTS = Math.max(0, PENDING_REQUESTS - 1);
    return error;
};

export const addInterceptors = (axiosInstance: AxiosInstance): AxiosInstance => {
    axiosInstance.interceptors.request.use(onRequest, onRequestError);
    axiosInstance.interceptors.response.use(onResponse, onResponseError);
    return axiosInstance;
};
