import { AxiosInstance } from 'axios';
import { APIClient } from '@greymass/eosio';

declare module 'vue/types/vue' {
  interface Vue {
    $axios: AxiosInstance;
    $api: APIClient;
  }
}
