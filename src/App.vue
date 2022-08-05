<script lang="ts">
import { setCssVar } from 'quasar';
import ConfigManager from 'src/config/ConfigManager';
import { themeProps } from './types/Theme';

const chain = ConfigManager.get().getCurrentChain();
const chainName = chain.getName();
const theme = chain.getTheme();

setTheme();
setMetaData();

function setTheme(): void {
  for (var themeVar of themeProps) {
    if (theme[themeVar]) setCssVar(themeVar, theme[themeVar]);
  }
}

function setMetaData(): void {
  var link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    (link as HTMLLinkElement).rel = 'icon';
    document.getElementsByTagName('head')[0].appendChild(link);
  }
  (link as HTMLLinkElement).href = `chains/${chainName}/favicon.png`;
}

export default {
  name: 'App'
};
</script>

<template lang="pug">
router-view
</template>
