/* eslint-disable @typescript-eslint/no-explicit-any */
/* Reference for Hyperion endpoints: https://rpc1.us.telos.net/v2/docs/static/index.html#/ */
import axios from 'axios';

const hyperion = axios.create({ baseURL: process.env.HYPERION_ENDPOINT });

export const getAccount = async function (address: string): Promise<any> {
  return await hyperion.get(`/v2/state/get_account?account=${address}`);
};
