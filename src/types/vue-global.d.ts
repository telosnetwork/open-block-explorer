import { AxiosInstance } from 'axios';
import { ApiClient } from 'src/types/Api';
import { UAL } from 'universal-authenticator-library';

declare module 'vue/types/vue' {
  interface Vue {
    $axios: AxiosInstance;
    $api: ApiClient;
    $ual: UAL;
  }
}
