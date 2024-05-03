<script lang="ts">
import AppFooter from 'components/Footer.vue';
import AppHeader from 'components/Header.vue';
import { setCssVar } from 'quasar';
import { DEFAULT_THEME } from 'src/config/BaseChain';
import { useNetworksStore } from 'src/stores/networks';
import { themeProps } from 'src/types/Theme';
import { defineComponent, onMounted, watch } from 'vue';

export default defineComponent({
    name: 'MainLayout',
    components: {
        AppHeader,
        AppFooter,
    },
    setup() {
        const networksStore = useNetworksStore();

        function setTheme(): void {
            const theme = networksStore.getCurrentNetwork.getTheme();

            for (let themeVar of themeProps) {
                if (theme[themeVar]) {
                    setCssVar(themeVar, theme[themeVar]);
                } else {
                    setCssVar(themeVar, DEFAULT_THEME[themeVar]);
                }
            }
        }

        function setMetaData(): void {
            const chainName = String(networksStore.getCurrentNetwork.getName());
            let link = document.querySelector('link[rel~="icon"]');
            (link as HTMLLinkElement).href = `chains/${chainName}/favicon.png`;

            document.title = chainName;
        }

        watch(networksStore.getCurrentNetwork, () => {
            setTheme();
            setMetaData();
        });

        onMounted(() => {
            setTheme();
            setMetaData();
        });

        return {
        };
    },
});
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
