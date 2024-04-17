import { boot } from 'quasar/wrappers';
import { getChain } from 'src/config/ConfigManager';

declare const fathom: { trackEvent: (eventName: string) => void };

export default boot(({ app }) => {
    const siteID = getChain().getFathomSiteId();
    if (siteID) {
        const script = document.createElement('script');
        script.src = 'https://cdn.usefathom.com/script.js';
        script.dataset.site = siteID;
        script.dataset.spa = 'auto';
        script.defer = true;
        script.onload = () => {
            app.config.globalProperties.$fathom = fathom;
        };
        document.body.appendChild(script);
    }
});
