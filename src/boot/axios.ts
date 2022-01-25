import { boot } from 'quasar/wrappers';
import axios, { AxiosInstance } from 'axios';
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
  }
}

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios;
});
