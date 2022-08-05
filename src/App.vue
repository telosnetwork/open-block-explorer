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
  setFavIcon();
  setTitle();
}

function setFavIcon(): void {
  let link = document.querySelector("link[rel~='icon']");
  (link as HTMLLinkElement).href = `chains/${chainName}/favicon.png`;
}

function setTitle(): void {
  document.title = chainName;
}

export default {
  name: 'App'
};
</script>

<template lang="pug">
router-view
</template>
