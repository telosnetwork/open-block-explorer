import { ApiClient } from 'src/types/Api';
import { UAL, User } from 'universal-authenticator-library';

declare module 'vue/types/vue' {
  interface Vue {
    $api: ApiClient;
    $ual: UAL;
    $user: User;
  }
}
