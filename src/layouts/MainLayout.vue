<script lang="ts">
import AppFooter from 'components/Footer.vue';
import AppHeader from 'components/Header.vue';
import { setCssVar, useQuasar } from 'quasar';
import { getChain } from 'src/config/ConfigManager';
import { themeProps } from 'src/types/Theme';
import { DEFAULT_THEME } from 'src/config/BaseChain';
import { defineComponent, onMounted, watch } from 'vue';
import { useRouteDataNetwork } from 'src/router';

export default defineComponent({
    name: 'MainLayout',
    components: {
        AppHeader,
        AppFooter,
    },
    setup() {
        const networkChain = useRouteDataNetwork();
        const $q = useQuasar();

        function setTheme(): void {
            const theme = getChain().getTheme();
            $q.dark.set(getChain().useDarkMode());
            for (let themeVar of themeProps) {
                if (theme[themeVar]) {
                    setCssVar(themeVar, theme[themeVar]);
                } else {
                    setCssVar(themeVar, DEFAULT_THEME[themeVar]);
                }
            }
        }

        function setMetaData(): void {
            const chainName = getChain().getName();
            let link = document.querySelector('link[rel~="icon"]');
            (link as HTMLLinkElement).href = `chains/${chainName}/favicon.png`;

            document.title = chainName;
        }

        watch(networkChain, () => {
            setTheme();
            setMetaData();
        });

        onMounted(() => {
            setTheme();
            setMetaData();
        });

        return {
            networkChain,
        };
    },
});
</script>

<template>
<q-layout view="lHh lpR lff">
    <div class="background-1"></div>
    <div class="background-2"></div>
    <q-header>
        <AppHeader/>
    </q-header>
    <q-page-container>
        <router-view />
    </q-page-container>
    <q-footer>
        <AppFooter/>
    </q-footer>
</q-layout>
</template>

<style lang="sass" scoped>
.q-header
    background: transparent
    backdrop-filter: blur(25px)

</style>
