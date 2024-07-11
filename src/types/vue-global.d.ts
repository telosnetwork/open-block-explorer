import { Session } from '@wharfkit/session';
import { ApiClient } from 'src/types/Api';
declare module 'vue/types/vue' {
  interface Vue {
    $api: ApiClient;
    $user: Session;
  }
}
