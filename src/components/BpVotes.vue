<script>
import { getHyperionAccountData } from 'src/api/hyperion';

export default {
    props: {
        account: {
            type: String,
            required: true,
        },
    },
    data() {
        return {
            bpVotes: [],
        };
    },
    async mounted() {
        const {
            account: {
                voter_info: { producers },
            },
        } = await getHyperionAccountData(this.account);
        this.bpVotes = producers;
    },
};
</script>

<template>
<div
    class="row col-12 q-my-xs justify-center text-left container-max-width"
>
    <div class="row col-11">
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
        // color: var(--q-primary);
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
