/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { boot } from 'quasar/wrappers';
import { api } from 'src/api';

export default boot(({ app }) => {
  app.config.globalProperties.$api = api;
});
