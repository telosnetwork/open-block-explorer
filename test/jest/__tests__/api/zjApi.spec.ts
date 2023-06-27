import { describe, it, jest } from '@jest/globals';
import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-jest';
import { AxiosInstance, AxiosInterceptorManager, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getTransactions, zjApi } from 'src/api/zjApi';
import { HyperionTransactionFilter } from 'src/types/Api';
import { TransactionFilter } from 'src/types/zj_tpyes/ZjActionData';

test('getTransactions', async () => {
    const response = await getTransactions({
        page: 1,
        limit: 2,
    });
    console.log(response.data);
});

test('zjApi', async () => {
    const response = await zjApi.getTransaction('fc1b39b32036345a26e0a059ecd83faf4525c52a03cff94c5dfebc50e');
    console.log(response);
});
