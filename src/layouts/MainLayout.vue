<script lang="ts">
import AppFooter from 'components/Footer.vue';
import AppHeader from 'components/Header.vue';

import { setCssVar } from 'quasar';
import ConfigManager from 'src/config/ConfigManager';
import { themeProps } from 'src/types/Theme';
import { DEFAULT_THEME } from 'src/config/BaseChain';
import { computed, defineComponent, onMounted, watch } from 'vue';

export default defineComponent({
    name: 'MainLayout',
    components: {
        AppHeader,
        AppFooter,
    },
    props: {
        network: {
            type: String,
            required: false,
        },
    },
    setup(props) {
        const networkChain = computed(() => props.network);

        function setTheme(): void {
            const theme = ConfigManager.get().getCurrentChain().getTheme();
            for (let themeVar of themeProps) {
                if (theme[themeVar]) {
                    setCssVar(themeVar, theme[themeVar]);
                } else {
                    setCssVar(themeVar, DEFAULT_THEME[themeVar]);
                }
            }
        }

        function setMetaData(): void {
            const chainName = ConfigManager.get().getCurrentChain().getName();
            console.log(chainName);
            let link = document.querySelector('link[rel~="icon"]');
            (link as HTMLLinkElement).href = `chains/${chainName}/favicon.png`;

            document.title = chainName;
        }

        watch(networkChain, () => {
            console.log('updating chain');
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
    <q-header>
        <AppHeader :network="networkChain"/>
        <q-separator class="separator"/>
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
.q-header
  background-color: var(--q-secondary)
.separator
  height: 2px
  min-height: 2px
</style>
