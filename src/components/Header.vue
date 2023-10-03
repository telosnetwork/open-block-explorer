<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import LoginHandler from 'components/LoginHandler.vue';
import HeaderSearch from 'components/HeaderSearch.vue';
import ChainsMenu from 'components/ChainsMenu.vue';
import ConfigManager, { getChain } from 'src/config/ConfigManager';
import { useStore } from 'src/store';
import { useRouteDataNetwork } from 'src/router';
import { HeaderSettings } from 'src/types/UiCustomization';

export default defineComponent({
    name: 'AppHeader',
    components: {
        LoginHandler,
        HeaderSearch,
        ChainsMenu,
    },
    setup() {
        const $q = useQuasar();
        const store = useStore();
        const headerSettings = computed(() : HeaderSettings => ConfigManager.get().getCurrentChain().getUiCustomization().headerSettings);

        const account = computed(() => store.state.account.accountName);
        const isLarge = computed((): boolean => $q.screen.gt.sm);
        const showMultichainSelector = computed(() => process.env.SHOW_MULTICHAIN_SELECTOR === 'true');

        const isTestnet = ref(getChain().isTestnet());
        const smallLogoPath = ref(getChain().getSmallLogoPath());
        const largeLogoPath = ref(getChain().getLargeLogoPath());

        const network = useRouteDataNetwork();

        watch(network, () => {
            smallLogoPath.value = getChain().getSmallLogoPath();
            largeLogoPath.value = getChain().getLargeLogoPath();
            isTestnet.value = getChain().isTestnet();
        });

        return {
            headerSettings,
            account,
            isLarge: isLarge,
            showMultichainSelector,
            smallLogoPath,
            largeLogoPath,
            isTestnet,
        };
    },
});
</script>

<template>
<div class="header-background">
    <div class="row text-center q-pt-sm justify-between q-pt-md">
        <div class="logo-container col-xs-3 col-sm-2 col-md-2 col-lg-2">
            <div class="q-px-xs-xs q-px-sm-xs q-px-md-md q-px-lg-md">
                <div class="logo-header-container">
                    <div class="logo-chain-selector-container">
                        <a class="float-left" href="/">
                            <img v-if="isLarge" class="logo" :src="largeLogoPath">
                            <img v-else class="logo-token" :src="smallLogoPath">
                        </a>
                        <ChainsMenu v-if="showMultichainSelector"/>
                    </div>
                    <div v-if="isTestnet" class="testnet-text">TESTNET</div>
                </div>
            </div>
        </div>
        <div class="col-xs-4 col-sm-6 col-md-4 col-lg-6">
            <div class="q-px-xs-xs q-px-sm-xs q-px-md-md q-px-lg-md">
                <div class="row justify-center full-width">
                    <div class="col-12">
                        <HeaderSearch/>
                    </div>
                </div>
            </div>
        </div>
        <LoginHandler v-if="!headerSettings.hideLoginHandler"/>
    </div>
    <div class="row justify-center col-12 q-pt-sm">
        <q-tabs
            active-class="active-tab"
            indicator-color="white"
            align="justify"
            narrow-indicator
            color="white"
        >
            <q-route-tab
                v-if="!headerSettings.hideNetworkTab"
                class="deactive"
                name="network"
                label="Network"
                to="/network"
            />
            <q-route-tab
                v-if="!headerSettings.hideWalletTab && account"
                class="deactive"
                name="wallet"
                label="Wallet"
                :to="'/account/' + account"
            />
            <q-route-tab
                v-if="!headerSettings.hideVoteTab"
                class="deactive"
                name="vote"
                label="Vote"
                to="/vote"
            />
            <q-route-tab
                v-if="!headerSettings.hideProposalTab"
                class="deactive"
                name="proposal"
                label="Proposal"
                to="/proposal"
            />
        </q-tabs>
    </div>
</div>
</template>

<style lang="sass" scoped>
.q-tab
    text-transform: unset
    font-size: 18px

.logo-header-container
    position: relative
    display: flex
    flex-direction: column
    gap: 8px
    width: fit-content

.logo-chain-selector-container
    padding-left: 4px
    display: flex
    flex-direction: row
    justify-content: space-between
    a
        margin-right: 4px

.logo
  width: 104px
  height:40px
  object-fit: contain

.logo-token
  width: 40px
  height: 40px
  object-fit: contain

.testnet-text
    position: absolute
    bottom: -20px
    color: white
    font-size: 10px
    width: 100%
    height: min-content
    padding: 4px 8px
    border-radius: 4px
    background-color: rgba(white, 0.1)

.active-tab
  text-decoration: none
  color: var(--q-color-header-text)
  opacity: 1 !important

.deactive
  opacity: 0.65
  font-size: 18px

.header-background
  border-bottom: 2px solid var(--q-color-header-border)
  background: var(--q-color-header-background)


</style>
