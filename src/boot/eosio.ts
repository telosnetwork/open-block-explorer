import { boot } from 'quasar/wrappers';
import { APIClient } from '@greymass/eosio';

const eosio = new APIClient({
  url: 'https://telos.caleos.io'
});

export default boot(({ app }) => {
  app.config.globalProperties.$eosio = eosio;
});
