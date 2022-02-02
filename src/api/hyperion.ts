import axios, { AxiosInstance } from 'axios';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $hyperion: AxiosInstance;
  }
}

const hyperion = axios.create({ baseURL: process.env.HYPERION_ENDPOINT });

export const getAccount = async function (address: string): Promise<any> {
  return await hyperion.get(`/v2/state/get_account?account=${address}`);
};
