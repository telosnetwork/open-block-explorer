import { boot } from 'quasar/wrappers';
import { ApiClient } from 'src/types/Api';
import { api } from 'src/api';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $api: ApiClient;
  }
}

export default boot(({ app }) => {
  app.config.globalProperties.$api = api;
});
