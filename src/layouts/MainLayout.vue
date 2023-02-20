<script lang="ts">
import AppFooter from 'components/Footer.vue';
import AppHeader from 'components/Header.vue';
import ChainsSidebar from 'components/ChainsSidebar.vue';

export default {
    name: 'MainLayout',
    components: {
        AppHeader,
        AppFooter,
        ChainsSidebar,
    },
    setup() {
        return {
            showSidebar: () => process.env.SHOW_SIDEBAR === 'true',
        };
    },
};
</script>

<template lang="pug">
q-layout( view="lHh lpR lff")
  q-header
    AppHeader
    q-separator.separator

  chains-sidebar(
    v-if="showSidebar()"
  )

  q-page-container
    router-view
    q-separator
  q-footer
    AppFooter
</template>

<style lang="sass" scoped>
.q-header
  background-color: var(--q-secondary)
.separator
  height: 2px
  min-height: 2px
</style>
