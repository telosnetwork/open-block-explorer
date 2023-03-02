import { boot } from 'quasar/wrappers';
import GreymassFuelService from 'src/api/fuel';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $fuel: GreymassFuelService;
  }
}

export default boot(({ app }) => {
    app.config.globalProperties.$fuel = GreymassFuelService;
    GreymassFuelService.setGlobals(app.config.globalProperties);
    GreymassFuelService.load();
});
