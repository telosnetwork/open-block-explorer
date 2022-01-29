import { boot } from 'quasar/wrappers';
import { APIClient } from '@greymass/eosio';
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $api: APIClient;
  }
}

const api = new APIClient({
  url: 'https://telos.caleos.io'
});

export default boot(({ app }) => {
  app.config.globalProperties.$api = api;
  debugger;
});
