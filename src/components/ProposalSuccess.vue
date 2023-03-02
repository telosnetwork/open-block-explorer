<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
    name: 'ProposalSuccess',
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
        transactionId: {
            type: String,
        },
        proposalName: {
            type: String,
        },
    },
    emits: ['update:modelValue'],
    setup(props, context) {
        const value = computed({
            get: () => props.modelValue,
            set: (value) => {
                context.emit('update:modelValue', value);
            },
        });

        return {
            value,
        };
    },
});
</script>

<template>
<q-dialog v-model="value" maximized>
    <q-card class="gradient-box">
        <q-card-section class="full-height row justify-center items-center">
            <div class="proposal-success__section-wrapper">
                <header class="q-mb-lg">
                    <img class="inline-block vertical-middle q-mr-md q-mb-md" src="~assets/send.svg">
                    <span class="text-h4 text-white inline-block vertical-middle q-mb-md">Proposal sent successfully</span>
                </header>
                <p class="text-h6 text-white q-ma-none q-mb-xl">
                    Check proposal at
                    <router-link :to="'/proposal/' + proposalName" class="text-primary text-white cursor-pointer">
                        {{ proposalName }}
                    </router-link>
                    and transaction at
                    <router-link :to="'/transaction/' + transactionId" class="text-primary text-white cursor-pointer">
                        {{ transactionId }}
                    </router-link>
                </p>
                <q-btn
                    class="full-width"
                    unelevated
                    padding="sm md"
                    color="primary"
                    label="Close and check proposal"
                    type="submit"
                    :to="'/proposal/' + proposalName"
                />
            </div>
        </q-card-section>
    </q-card>
</q-dialog>
</template>
<style lang="sass">
.proposal-success
  &__section-wrapper
    max-width: 600px
</style>
