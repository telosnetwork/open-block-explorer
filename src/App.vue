<script lang="ts">
import { setCssVar } from 'quasar';
import ConfigManager from 'src/config/ConfigManager';

const themeVars: string[] = [
  'primary',
  'secondary',
  'accent',
  'dark',
  'positive',
  'negative',
  'info',
  'warning',
  'color-primary-gradient',
  'color-secondary-gradient',
  'color-tertiary-gradient',
  'color-progress-gradient',
  'color-producer-card-background',
  'color-select-box-background'
];

const theme = ConfigManager.get().getCurrentChain().getTheme();

setTheme();

function setTheme(): void {
  for (var themeVar of themeVars) {
    if (theme[themeVar]) setCssVar(themeVar, theme[themeVar]);
  }
}

export default {
  name: 'App'
};
</script>

<template lang="pug">
router-view
</template>
