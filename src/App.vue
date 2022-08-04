<script lang="ts">
import { /*colors,*/ getCssVar, setCssVar } from 'quasar';
import { getChain } from 'src/config/ConfigManager';
// import variables from 'telos-testnet.scss';

const quasarThemeVars: string[] = [
  'primary',
  'secondary',
  'accent',
  'dark',
  'positive',
  'negative',
  'info',
  'warning'
];

const customThemeVars: string[] = [
  'color-primary-gradient',
  'color-secondary-gradient',
  'color-tertiary-gradient',
  'color-progress-gradient',
  'color-producer-card-background',
  'color-select-box-background'
];

const chainName = getChain().getName();

setTheme();

function setTheme(): void {
  for (var themeVar of quasarThemeVars) {
    let themeVal = getCssVar(`color-${themeVar}-${chainName}`) || '';
    setCssVar(themeVar, themeVal);
  }
  for (var themeVar of customThemeVars) {
    let themeVal = getCssVar(`${themeVar}-${chainName}`) || '';
    setCssVar(themeVar, themeVal);
  }
}

export default {
  name: 'App'
};
</script>

<template lang="pug">
router-view
</template>
