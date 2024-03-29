<script lang="ts">
import { watch } from 'vue';
import { api } from 'src/api';
import { Token } from 'src/types';
import { defineComponent, onMounted, ref, toRef } from 'vue';
export default defineComponent({
    name: 'TokensPanel',
    props: {
        account: {
            type: String,
            required: false,
            default: null,
        },
    },
    setup(props) {
        const tokens = ref<Token[]>([]);
        const account = toRef(props, 'account');

        const getURLFilters = (name: string): string[] => {
            // TODO: change this implementation and use this.$route
            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);
            if (urlParams.has(name)) {
                return urlParams.get(name).split(',');
            } else {
                return [];
            }
        };
        watch(account, async () => {
            tokens.value = [];
            await loadTokens();
        });

        const loadTokens = async (): Promise<void> => {
            // TODO Refactor redundant getTokens in AccountCard
            const tokenList = await api.getTokens(account.value);

            const codes = getURLFilters('code');
            const symbols = getURLFilters('symbol');
            let filtered = tokenList
                .filter(
                    (token: Token) =>
                        codes.length === 0 || codes.some(c => c === token.contract),
                )
                .filter(
                    (token: Token) =>
                        symbols.length === 0 || symbols.some(c => c === token.symbol),
                );

            tokens.value = filtered.map(
                token =>
                    ({
                        ...token,
                        contract: formatAccount(token.contract, 'account'),
                    } as Token),
            );

            tokens.value = tokens.value.filter(
                token => (token as Token).amount !== null,
            );
        };
        // TODO Refactor duplicate function in TransactionsTable
        const formatAccount = (
            name: string,
            type: 'account' | 'transaction' | 'block',
        ): string => `<a href="/${type}/${name}" class="hover-dec">${name}</a>`;

        onMounted(async () => {
            await loadTokens();
        });

        return {
            tokens,
            formatAccount,
            loadTokens,
        };
    },
});
</script>
<template>
<div class="row col-12 q-my-xs justify-center text-left container-max-width">
    <div class="row col-11">
        <div class="row col-12 q-mt-lg">
            <div>
                <p class="panel-title">Tokens</p>
            </div>
            <q-space/>
        </div>
        <q-separator class="row col-12 q-mt-md separator"/>
        <div class="col-12 q-mt-md tokens-container">
            <div v-if="tokens.length === 0">No tokens found</div>
            <q-card v-for="token in tokens" :key="`${token.contract}-${token.symbol}`" class="token-card">
                <q-item>
                    <q-item-section class="items-center" avatar>
                        <q-avatar class="shadow-3" color="white" size="2.8rem">
                            <q-avatar size="1.2em"><img :src="token.logo"></q-avatar>
                        </q-avatar>
                    </q-item-section>
                    <q-item-section>
                        <div v-html="token.contract"></div>
                        <div class="text-bold">{{`${token.amount} ${token.symbol}`}}</div>
                        <!-- TODO Get USD value from oracle-->
                    </q-item-section>
                </q-item>
            </q-card>
        </div>
    </div>
</div>
</template>
<style lang="sass" scoped>
.hover-dec
  text-decoration: none
  color: var(--q-dark)
  &:hover
    text-decoration: underline

.tokens-container
  display: grid
  grid-gap: 2rem
  align-items: stretch
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))
  grid-template-rows: min-content

.token-card
  background: rgba(138, 101, 212, 0.1)
  border-radius: .2rem
  box-shadow: none
  padding: 0.5rem 0
</style>
