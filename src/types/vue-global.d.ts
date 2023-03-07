import { Session, SessionKit } from '@wharfkit/session';
import { AxiosInstance } from 'axios';
import { ApiClient } from 'src/types/Api';

declare module 'vue/types/vue' {
  interface Vue {
    $axios: AxiosInstance;
    $api: ApiClient;
    $kit: SessionKit;
    $user: Session;
  }
}
