<script setup lang="ts">
import { ref, defineProps, onBeforeMount, watch, computed } from 'vue';
import { getHyperionAccountData } from 'src/api/hyperion';
import { api } from 'src/api';
import { GetTableRowsParams } from 'src/types';
import { getChain } from 'src/config/ConfigManager';
import { Name } from '@wharfkit/session';
import { formatCurrency } from 'src/utils/string-utils';

const chain = getChain();
const symbol = chain.getSystemToken().symbol;

const  props = defineProps({
    account: {
        type: String,
        required: true,
    },
});

const bpVotes = ref([]);
const isProducer = ref(false);
const isSelfStaking = ref(false);
const hasBoostActive = ref(false);
const selfStakedAmount = ref(0);
const selfStakeBoostVotes = ref(0);
const totalVotes = ref(0);
const producerRank = ref(0);
const numProducersVoted = ref(0);

const fetchVotes = async () => {
    try {
        const {
            account: {
                voter_info: { producers },
            },
        } = await getHyperionAccountData(props.account);
        bpVotes.value = producers;
    } catch(e) {
        console.error(e);
    }
};

const fetchSelfStakeInfo = async () => {
    try {
        // Check if this account is a registered producer
        const producerResult = await api.getTableRows({
            code: 'eosio',
            scope: 'eosio',
            table: 'producers',
            lower_bound: Name.from(props.account),
            limit: 1,
        }) as { rows: { owner: string; is_active: number; total_votes: string }[] };

        if (producerResult.rows.length > 0 && producerResult.rows[0].owner === props.account && producerResult.rows[0].is_active === 1) {
            isProducer.value = true;
            totalVotes.value = parseFloat(producerResult.rows[0].total_votes);

            // Get rank
            const allProducers = (await api.getProducers()).rows;
            const activeProducers = allProducers
                .filter(p => p.is_active === 1)
                .sort((a, b) => b.total_votes - a.total_votes);
            const rankIndex = activeProducers.findIndex(p => p.owner === props.account);
            producerRank.value = rankIndex >= 0 ? rankIndex + 1 : 0;
        } else {
            isProducer.value = false;
            return;
        }

        // Check voter info for self-stake
        const voterResult = await api.getTableRows({
            code: 'eosio',
            scope: 'eosio',
            table: 'voters',
            lower_bound: Name.from(props.account),
            limit: 1,
        }) as { rows: { owner: string; staked: number; self_stake_boost: number; producers: string[]; last_vote_weight: number }[] };

        if (voterResult.rows.length > 0 && voterResult.rows[0].owner === props.account) {
            const voter = voterResult.rows[0];
            selfStakedAmount.value = voter.staked;
            numProducersVoted.value = voter.producers.length;
            isSelfStaking.value = voter.producers.includes(props.account);
            hasBoostActive.value = voter.self_stake_boost > 0 && isSelfStaking.value;
            if (hasBoostActive.value) {
                selfStakeBoostVotes.value = 10 * voter.last_vote_weight;
            }
        }
    } catch(e) {
        console.error(e);
    }
};

const boostStatus = computed(() => {
    if (!isProducer.value) return 'not-producer';
    if (hasBoostActive.value) return 'active';
    if (isSelfStaking.value) return 'needs-activation';
    return 'not-self-staking';
});

onBeforeMount(async () => {
    await fetchVotes();
    await fetchSelfStakeInfo();
});
watch(() => props.account, async () => {
    bpVotes.value = [];
    isProducer.value = false;
    isSelfStaking.value = false;
    hasBoostActive.value = false;
    await fetchVotes();
    await fetchSelfStakeInfo();
});
</script>

<template>
<div
    class="row col-12 q-my-xs justify-center text-left container-max-width"
>
    <div class="row col-11">
        <!-- Self-Stake Boost Section (for registered producers) -->
        <div v-if="isProducer" class="row col-12 q-mt-lg">
            <div class="col-12">
                <p class="panel-title">Block Producer Self-Stake</p>
            </div>
            <q-separator class="row col-12 q-mt-md q-mb-md separator" />

            <div class="col-12 q-pa-md">
                <div class="row q-col-gutter-md">
                    <!-- Rank & Votes -->
                    <div class="col-12 col-sm-4">
                        <div class="self-stake-stat">
                            <div class="self-stake-label">Producer Rank</div>
                            <div class="self-stake-value">#{{ producerRank }}</div>
                        </div>
                    </div>
                    <div class="col-12 col-sm-4">
                        <div class="self-stake-stat">
                            <div class="self-stake-label">Total Votes</div>
                            <div class="self-stake-value">{{ (totalVotes / 10000).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0}) }}</div>
                        </div>
                    </div>
                    <div class="col-12 col-sm-4">
                        <div class="self-stake-stat">
                            <div class="self-stake-label">Voting For</div>
                            <div class="self-stake-value">{{ numProducersVoted }} / 30 BPs</div>
                        </div>
                    </div>

                    <!-- Self-Stake Info -->
                    <div class="col-12 col-sm-4">
                        <div class="self-stake-stat">
                            <div class="self-stake-label">Self-Staked</div>
                            <div class="self-stake-value">{{ (selfStakedAmount / 10000).toLocaleString(undefined, {minimumFractionDigits: 4, maximumFractionDigits: 4}) }} {{ symbol }}</div>
                        </div>
                    </div>
                    <div class="col-12 col-sm-4">
                        <div class="self-stake-stat">
                            <div class="self-stake-label">10x Boost Status</div>
                            <div class="self-stake-value">
                                <q-chip
                                    v-if="boostStatus === 'active'"
                                    color="primary"
                                    text-color="white"
                                    label="Active"
                                    size="sm"
                                    icon="verified"
                                />
                                <q-chip
                                    v-else-if="boostStatus === 'needs-activation'"
                                    outline
                                    color="warning"
                                    text-color="warning"
                                    label="Needs Re-Vote"
                                    size="sm"
                                    icon="info"
                                >
                                    <q-tooltip>Self-stakes but boost not activated. Re-vote or change stake to activate the 10x multiplier.</q-tooltip>
                                </q-chip>
                                <q-chip
                                    v-else-if="boostStatus === 'not-self-staking'"
                                    outline
                                    color="negative"
                                    text-color="negative"
                                    label="Not Self-Staking"
                                    size="sm"
                                    icon="warning"
                                >
                                    <q-tooltip>This producer does not vote for itself. Self-staking enables a 10x vote weight boost.</q-tooltip>
                                </q-chip>
                            </div>
                        </div>
                    </div>
                    <div v-if="hasBoostActive" class="col-12 col-sm-4">
                        <div class="self-stake-stat">
                            <div class="self-stake-label">Boost Votes</div>
                            <div class="self-stake-value">+{{ (selfStakeBoostVotes / 10000).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0}) }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Votes for Block Producers Section -->
        <div class="row col-12 q-mt-lg">
            <div>
                <p class="panel-title">Votes for Block Producers</p>
            </div>
            <q-space />
        </div>
        <q-separator class="row col-12 q-mt-md separator" />
        <div class="info-wrap">
            <div class="row voted-producers q-pa-md">
                <p>Currently voting for the {{ bpVotes.length }} out of 30 possible block producers:</p>
                <div v-if="bpVotes.length" class="producers-list">
                    <span
                        v-for="producer in bpVotes"
                        v-bind:key="producer"
                        class="producer-name"
                    >
                        <a :href="`/account/${producer}`">{{ producer }}</a>
                    </span>
                </div>
            </div>
        </div>
    </div>
</div>
</template>

<style lang="scss">
.self-stake-stat {
    text-align: center;
    padding: 0.5rem;

    .self-stake-label {
        font-size: 11px;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.5);
        margin-bottom: 4px;
    }

    .self-stake-value {
        font-size: 16px;
        font-weight: 600;
        color: white;
    }
}

.info-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    @media (min-width: $breakpoint-sm-min) {
        flex-direction: row-reverse;
        align-items: flex-start;
    }

    .vote-fraction-wrap {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;

        .bp-vote-circle {
            color: var(--q-primary);
        }

        @media (min-width: $breakpoint-sm-min) {
            border-left: 1px solid var(--q-color-seperator-background);
        }
    }

    .voted-producers {
        display: block;
        width: 100%;

        p {
            margin-bottom: 20px;
            width: 100%;
            display: none;

            @media (min-width: $breakpoint-sm-min) {
                display: block;
            }
        }

        .producers-list {
            width: 100%;
            /* make grid with column width 100px and 20px margin */
            display: inline-grid;
            grid-template-columns: repeat(auto-fill, 100px);
            grid-gap: 20px;

            .producer-name {
                width: 100px;
                margin-right: 20px;

                a {
                    text-decoration: none;
                    color: var(--q-primary);
                }
            }
        }
    }
}
</style>
