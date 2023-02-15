<script lang="ts">
import {
    defineComponent,
    ref,
    computed,
    PropType,
    watch,
    onMounted,
} from 'vue';
import { copyToClipboard, useQuasar } from 'quasar';
import { Block } from 'src/types';
import { useRouter } from 'vue-router';

export default defineComponent({
    name: 'BlockCard',
    props: {
        block: {
            type: Object as PropType<Block>,
            required: false,
            default: null,
        },
    },
    setup(props) {
        const router = useRouter();
        const q = useQuasar();
        const Block = computed(() => props.block);
        const blockInfo = ref<{ key: string; value: string }[]>([]);
        async function nextBlock() {
            await router.push({
                name: 'block',
                params: {
                    block: Block.value.block_num + 1,
                },
            });
            router.go(0);
        }
        async function previousBlock() {
            await router.push({
                name: 'block',
                params: {
                    block: Block.value.block_num - 1,
                },
            });
            void router.go(0);
        }
        function copy(value: string) {
            copyToClipboard(value)
                .then((): void => {
                    q.notify({
                        color: 'green-4',
                        textColor: 'white',
                        message: 'Copied to clipboard',
                        timeout: 1000,
                    });
                })
                .catch(() => {
                    q.notify({
                        color: 'red-8',
                        textColor: 'white',
                        message: 'Could not copy',
                        timeout: 1000,
                    });
                });
        }
        function numberWithCommas(x: number) {
            if (!x) {return 0;}
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
        function formatDate(date: string): string {
            return new Date(date).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
            });
        }
        function setBlockData() {
            if (Block.value) {
                let actionCount = 0;
                let cpu = 0;
                let net = 0;
                Block.value.transactions.forEach((tx) => {
                    if (tx.trx.transaction && tx.trx.transaction.actions) {
                        actionCount += tx.trx.transaction.actions.length;
                    }
                    cpu += tx.cpu_usage_us;
                    net += tx.net_usage_words;
                });
                blockInfo.value = [
                    { key: 'Producer', value: Block.value.producer },
                    { key: 'Block time', value: formatDate(Block.value.timestamp) },
                    { key: 'CPU usage', value: cpu.toString() + ' μs' },
                    { key: 'Net usage', value: (net * 8).toString() + ' Bytes' },
                    {
                        key: 'Schedule Version',
                        value: Block.value.schedule_version.toString(),
                    },
                    {
                        key: 'Transactions',
                        value: Block.value.transactions.length.toString(),
                    },
                    { key: 'Actions', value: actionCount.toString() },
                ];
            }
        }
        watch(Block, () => {
            setBlockData();
        });
        onMounted(() => {
            setBlockData();
        });
        return {
            block_num: computed(() => Block.value?.block_num || 0),
            nextBlock,
            previousBlock,
            numberWithCommas,
            formatDate,
            copy,
            blockInfo,
        };
    },
});
</script>

<template lang="pug">
.row.full-width.justify-center
  .col-xs-12.col-md-8.col-lg-6
    q-card(flat class="info-card")
      .q-pa-md-md.q-pa-sm-sm.q-pa-xs-xs.q-pa-xl-lg
        q-card-section.q-pl-md
          .row.q-col-gutter-sm.justify-between
            .col-auto(class="text-h4 text-bold") Block
            .col-auto
              .row.q-col-gutter-sm
                .col-auto
                  q-btn.button-primary( @click="previousBlock" flat dense size='md' icon='arrow_back' )
                .col-auto
                  q-btn.button-primary( @click="nextBlock" flat dense size='md' icon='arrow_forward' )

        q-card-section.q-pt-none
          .row.items-center
            .col-11.text-bold.ellipsis {{numberWithCommas(block_num)}}
            .col-1
              q-btn.float-right( @click="copy(block_num.toString())" flat round color="black" icon="content_copy" size='sm')

        q-card-section
          .text-grey-7 SUMMARY
        div(v-for='item in blockInfo')
          q-separator(inset).card-separator
          q-card-section
            .row
              .col-xs-12.col-sm-6
                .text-body1.text-weight-medium.text-uppercase {{item.key}}
              .col-xs-12.col-sm-6.text-right.text-bold {{item.value}}

</template>

<style lang="sass"></style>
