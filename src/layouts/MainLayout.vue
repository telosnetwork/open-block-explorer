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

<template>

<q-layout view="lHh lpR lff">
    <q-header>
        <AppHeader/>
        <q-separator class="separator"/>
    </q-header>
    <ChainsSidebar v-if="showSidebar()"/>
    <q-page-container>
        <router-view/>
        <q-separator/>
    </q-page-container>
    <q-footer>
        <AppFooter/>
    </q-footer>
</q-layout>
</template>

<style lang="sass" scoped>
.q-header
  background-color: var(--q-secondary)
.separator
  height: 2px
  min-height: 2px
</style>
