<script lang="ts">
import { setCssVar } from 'quasar';
import ConfigManager from 'src/config/ConfigManager';
import { themeProps } from './types/Theme';

const theme = ConfigManager.get().getCurrentChain().getTheme();

setTheme();

function setTheme(): void {
  for (var themeVar of themeProps) {
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
