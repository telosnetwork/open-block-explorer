<template>
<q-badge :color="typeColor">
    {{typeDesc}}
    <q-tooltip>
        type:{{ type}}
    </q-tooltip>
</q-badge>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
    name: 'TypeFormat',
    props: {
        type: {
            type: Number,
            default:0,
        },
    },
    setup(props) {
        const accType = computed(() => props.type);
        let typeColor = '';
        let typeDesc  = '';
        const initType = () =>{
            const value = accType.value;
            if (value === 16) {
                typeColor = 'dark';
                typeDesc = 'statistic';
            } else if (value === 8) {
                typeColor = 'negative';
                typeDesc = 'genesis';
            } else if (value === 9) {
                typeColor = 'info';
                typeDesc = 'LocalTo';
            } else if (value === 7) {
                typeColor = 'dark';
                typeDesc = 'statistic';
            } else if (value === 6) {
                typeColor = 'dark';
                typeDesc = 'timer';
            } else if (value === 5) {
                typeColor = 'positive';
                typeDesc = 'transfer';
            } else if (value === 4) {
                typeColor = 'info';
                typeDesc = 'new_contract';
            } else if (value === 3) {
                typeColor = 'info';
                typeDesc = 'new_addr';
            } else if (value === 2) {
                typeColor = 'negative';
                typeDesc = 'genesis';
            } else if (value === 1) {
                typeColor = 'negative';
                typeDesc = 'BatchTo';
            } else if (value === 0) {
                typeColor = 'positive';
                typeDesc = 'From';
            } else {
                typeColor = 'positive';
                typeDesc = 'consensus';
            }
        };
        initType();
        return {
            accType,
            typeColor,
            typeDesc,
        };
    },
});
</script>

<style scoped lang="sass">

</style>
