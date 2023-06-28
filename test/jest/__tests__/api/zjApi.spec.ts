
import { getTransactions, zjApi } from 'src/api/zjApi';

test('getTransactions', async () => {
    const response = await getTransactions({
        page: 1,
        limit: 2,
    });
    console.log(response.data);
});

test('getTransaction', async () => {
    const response = await zjApi.getTransaction('fc1b39b32036345a26e0a059ecd83faf4525c52a03cff94c5dfebc50e');
    console.log(response);
});

test('getBlock', async () => {
    const response = await zjApi.getBlock('fe62c1212610d16c120275b1d1807255fb3c62a0208cf12803955a82c301840e');
    const jsonObject = JSON.stringify(response);
    console.log(jsonObject);
});
