<script lang="ts">
import AppFooter from 'components/Footer.vue';
import AppHeader from 'components/Header.vue';

export default {
    name: 'MainLayout',
    components: {
        AppHeader,
        AppFooter,
    },
};
</script>

<template>

<q-layout view="lHh lpR lff">
    <q-header>
        <AppHeader/>
    </q-header>
    <q-page-container>
        <router-view/>
    </q-page-container>
    <q-footer>
        <AppFooter/>
    </q-footer>
</q-layout>
</template>

<style lang="sass" scoped>
</style>
