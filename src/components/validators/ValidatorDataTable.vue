<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { useStore } from 'src/store';
import { Producer } from 'src/types';
import { getChain } from 'src/config/ConfigManager';

const chain = getChain();

const MAX_VOTE_PRODUCERS = 30;

export default defineComponent({
    name: 'ValidatorDataTable',
    props: {
        top21pay24h: { type: Number, required: true },
    },
    setup(props) {
        const store = useStore();
        const symbol = chain.getSystemToken().symbol;
        const account = computed(() => store.state.account.accountName);
        const previousVote = computed(() =>
            store.state.account.data.voter_info
                ? store.state.account.data.voter_info.producers.map(vote =>
                    vote.toString(),
                )
                : [],
        );
        const producers = computed(() =>
            [...store.state.chain.producers].map(val => val.owner),
        );
        const currentVote = computed(() => {
            let votes = [...store.state.account.vote];
            votes.forEach((vote, index) => {
                if (!producers.value.includes(vote)) {
                    votes.splice(index, 1);
                }
            });
            return votes;
        });
        const selection = ref<string[]>([]);
        const HeadProducer = computed(
            (): string => store.state.chain.head_block_producer,
        );
        const producerRows = computed(
            (): Producer[] => store.state.chain.producers || [],
        );
        const producerPay = computed(() => props.top21pay24h);
        const bpTop21 = computed(() => store.state.chain.producerSchedule);

        const maxSelected = computed(
            () => currentVote.value.length === MAX_VOTE_PRODUCERS,
        );

        const pagination = ref({
            rowsPerPage: 21,
        });
        function removeVote(index: string) {
            currentVote.value.splice(Number(index), 1);
        }
        function getLink(domain: string, username: string) {
            return `https://${domain}/${username}`;
        }

        function getFlag(alpha2: number) {
            if (alpha2) {
                return `flag-icon-${alpha2}`;
            }
            return '';
        }

        function updateVote(val: string[]) {
            val.forEach((vote, index) => {
                if (!producers.value.includes(vote)) {
                    val.splice(index, 1);
                }
            });
            store.commit('account/setVote', val);
        }

        function isTop21(val: string): boolean {
            return bpTop21.value.includes(val);
        }

        return {
            producerRows,
            account,
            previousVote,
            HeadProducer,
            selection,
            maxSelected,
            currentVote,
            pagination,
            producerPay,
            symbol,
            updateVote,
            removeVote,
            isTop21,
            getLink,
            getFlag,
        };
    },
});
</script>

<template>

<div class="vd-table q-pa-md">
    <div class="vd-table__list bp-list">
        <div class="vd-table__list-row q-col-gutter-sm">
            <div class="vd-table__list-col col-12">
                <q-card flat>
                    <div class="q-card-section q-pa-md text-subtitle1 text-weight-light">
                        <div class="row">
                            <div class="col-1">Rank</div>
                            <div class="col-3"> BP</div>
                            <div class="col-2 offset-1"> Rank</div>
                            <div class="col-2"> Votes</div>
                            <div class="col-2"> Reward 24h</div>
                        </div>
                    </div>
                </q-card>
            </div>
            <div
                v-for="(bp,i) in producerRows"
                :key="i"
                class="vd-table__list-col col-12"
            >
                <q-card class="producer-card" flat>
                    <div class="q-card-section">
                        <div class="row">
                            <div class="col-1 q-py-md">
                                <div class="row items-center full-height text-h6 q-px-md">{{producerRows.indexOf(bp) + 1}}</div>
                            </div>
                            <div class="col-3 q-py-md"><a class="hover-dec" :href=" '/account/' + bp.owner">
                                                           <div class="text-uppercase text-h6 text-black">{{ bp.name|| bp.owner }}</div></a>
                                <div class="text-body2">{{ bp.location }}</div>
                            </div>
                            <div class="col-2 q-py-md offset-1">
                                <div class="row items-center full-height">
                                    <q-chip
                                        v-if="HeadProducer === bp.owner "
                                        square
                                        color="primary"
                                        text-color="white"
                                        label="Producing"
                                    />
                                    <q-chip
                                        v-else-if="(producerRows.indexOf(bp) + 1) < 22"
                                        outline
                                        square
                                        color="primary"
                                        text-color="white"
                                        label="Top 21"
                                    />
                                    <q-chip
                                        v-else-if="(producerRows.indexOf(bp) + 1) < 43"
                                        outline
                                        square
                                        color="primary"
                                        text-color="white"
                                        label="Standby"
                                    />
                                    <q-chip
                                        v-else
                                        outline
                                        square
                                        color="primary"
                                        text-color="white"
                                        label="Unpaid Standby"
                                    />
                                </div>
                            </div>
                            <div class="col-2 q-py-md">
                                <div class="row items-center full-height">{{ (bp.total_votes / 10000).toLocaleString(undefined, {minimumFractionDigits: 4,maximumFractionDigits: 4,}) }}</div>
                            </div>
                            <div class="col-2 q-py-md">
                                <div class="row items-center full-height">{{ ((producerRows.indexOf(bp) + 1) < 22 ? producerPay : (producerRows.indexOf(bp) + 1) < 43 ? producerPay / 2 : 0 ).toFixed(0)  + ` ${symbol}` }}</div>
                            </div>
                            <div class="col-1 select-box q-py-md">
                                <div class="row full-selection justify-center">
                                    <q-checkbox
                                        v-model="currentVote"
                                        :val="bp.owner"
                                        :disable="!currentVote.includes(bp.owner) && currentVote.length >= 30"
                                        @update:model-value="(val)=> updateVote(val)"
                                    />
                                </div>
                                <div class="row full-selection justify-center">
                                    <q-badge v-if="previousVote.includes(bp.owner)" color="green" label="VOTED"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </q-card>
            </div>
        </div>
    </div>
</div>
</template>

<style lang="sass" scoped>
.vd-table
  &__list
    width: 100%
    &-row
      overflow-x: auto
    &-col
      min-width: 1000px
.producer-card
  background: var(--q-color-producer-card-background)
.select-box
  background: var(--q-color-select-box-background)
.hover-dec
  text-decoration: none
  &:hover
    text-decoration: underline
    color: black

</style>
