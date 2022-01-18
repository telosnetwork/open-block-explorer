import { AxiosInstance } from 'axios';

declare module 'vue/types/vue' {
  interface Vue {
    $hyperion: AxiosInstance;
    $axios: AxiosInstance;
  }
}
