import { boot } from 'quasar/wrappers';
import ConfigManager from 'src/config/ConfigManager';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $config: ConfigManager;
  }
}

export default boot(({ app }) => {
  app.config.globalProperties.$config = ConfigManager.get();
});
