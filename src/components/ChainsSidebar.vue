<script lang="ts">
import { computed, ref, onMounted } from 'vue';
import ConfigManager from 'src/config/ConfigManager';
import { Chain } from 'src/types/Chain';

const configMgr = ConfigManager.get();

export default {
    name: 'ChainsSidebar',
    setup() {
        const mainnets = computed(() => sortChainsUsingName(configMgr.getMainnets()));
        const testnets = computed(() => sortChainsUsingName(configMgr.getTestnets()));

        function sortChainsUsingName(chains: Chain[]): Chain[] {
            return chains.sort(
                (chain1, chain2) => chain1.getName().localeCompare(chain2.getName()),
            );
        }

        function isSelected(chain: Chain): boolean {
            return localStorage.getItem(ConfigManager.CHAIN_LOCAL_STORAGE) === chain.getName();
        }

        function chainSelected(chain: Chain) {
            if (isSelected(chain)) {
                return;
            }
            // TODO: maybe we can reload vue store and boot files instead of full reload?
            localStorage.setItem(
                ConfigManager.CHAIN_LOCAL_STORAGE,
                chain.getName(),
            );
            location.reload();
        }

        onMounted(() => {
            const currentChain = localStorage.getItem(ConfigManager.CHAIN_LOCAL_STORAGE);
            if (currentChain === null) {
                const chains = configMgr.getMainnets();
                const telos = chains.filter(chain => chain.getName() === 'telos')[0];
                chainSelected(telos);
            }
        });

        return {
            miniState: ref(true),
            mainnets,
            testnets,
            chainSelected,
            isSelected,
        };
    },
};
</script>

<template>

<q-drawer
    show-if-above
    :mini="miniState"
    mini-to-overlay
    :width="175"
    :breakpoint="500"
    bordered
    @mouseover="miniState = false"
    @mouseout="miniState = true"
>
    <q-scroll-area class="fit">
        <q-list>
            <q-item
                v-for="(chain, index) in mainnets"
                :key="`mainnet-${index}`"
                v-ripple
                :class="{ selected: isSelected(chain) }"
                clickable
                @click="chainSelected(chain)"
            ><img class="sidebar-logo" :src="chain.getSmallLogoPath()">
                <q-item-section>
                    <div class="q-pl-md">{{ chain.getDisplay() }}</div>
                </q-item-section>
            </q-item>
            <q-separator class="separator"/>
            <q-item
                v-for="(chain, index) in testnets"
                :key="`testnet-${index}`"
                v-ripple
                :class="{ selected: isSelected(chain) }"
                clickable
                @click="chainSelected(chain)"
            >
                <div class="testnet-logo-container">
                    <img class="sidebar-logo sidebar-logo--testnet" :src="chain.getSmallLogoPath()">
                    <div class="testnet-text">Testnet</div>
                </div>
                <q-item-section>
                    <div class="q-pl-md">{{ chain.getDisplay() }}</div>
                </q-item-section>
            </q-item>
        </q-list>
    </q-scroll-area>
</q-drawer>

</template>

<style lang="sass" scoped>
.q-item
  &:hover, &.selected
    background-color: var(--q-color-sidebar-selected)
  padding-left: 4px
  padding-top: 4px

.separator
  margin-top: .5rem
  margin-bottom: .5rem
  margin-left: 5px
  min-height: 5px
  min-width: 0
  width: calc(100% - 10px)
  background: var(--q-color-sidebar-selected)

.sidebar-logo
  height: auto
  width: auto
  max-height: 48px
  max-width: 48px
  object-fit: contain

.testnet-logo-container
    position: relative
    height: 48px
    width: 48px

.testnet-text, .sidebar-logo--testnet
    position: absolute
    margin: auto
    top: 0
    right: 0
    bottom: 0
    left: 0

.testnet-text
    color: white
    font-size: 12px
    width: min-content
    height: min-content
    padding: 0 2px
    border-radius: 2px
    background-color: rgba(black, 0.6)
</style>
