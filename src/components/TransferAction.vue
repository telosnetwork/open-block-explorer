<script lang="ts">
import AccountSearch from 'components/AccountSearch.vue';
import { useNetworksStore } from 'src/stores/networks';
import { ProposalAction } from 'src/types';
import {
    computed,
    defineComponent,
    onMounted,
    PropType,
    reactive,
    watch,
} from 'vue';


interface Field {
  name: string;
  type: string;
}

export default defineComponent({
    name: 'TransferAction',
    components: {
        AccountSearch,
    },
    props: {
        modelValue: {
            type: Object as PropType<ProposalAction>,
        },
        fields: {
            type: Object as PropType<Field[]>,
        },
    },
    setup(props, context) {
        const networksStore = useNetworksStore();
        const action = reactive<ProposalAction>(props.modelValue);
        const { precision, symbol } = networksStore.getCurrentNetwork.getSystemToken();

        const mask = computed(() => {
            let mask = '#';
            if (precision > 0) {
                mask += `.${'#'.repeat(precision)}`;
            }
            return mask;
        });

        const updateAction = (newAction: ProposalAction) => {
            let actionToFormat = { ...newAction };
            const numberArray = actionToFormat.data.quantity.match(/\d+/g);

            let quantity = '0';
            let fractionPart = '';

            if (numberArray?.length > 0) {
                quantity = numberArray[0] + '.';
                fractionPart = numberArray[1] ?? '';
            }

            // slice will cap the fraction part to precision and padEnd will fill the precision with zeros if needed
            quantity += fractionPart.slice(0, precision).padEnd(precision, '0');
            actionToFormat.data.quantity = quantity;

            action.data = { ...actionToFormat.data };
        };

        onMounted(() => {
            updateAction(props.modelValue);
        });

        watch(() => props.modelValue, (currentValue) => {
            updateAction(currentValue);
        });

        watch(action, (currentValue) => {
            if (!currentValue.data.quantity.includes(symbol)) {
                currentValue.data.quantity = `${currentValue.data.quantity} ${symbol}`;
            }
            context.emit('update:modelValue', currentValue);
        });

        return {
            mask,
            symbol,
            action,
        };
    },
});
</script>

<template>

<div v-if="!!fields" class="row q-col-gutter-md">
    <div v-for="field in fields" :key="field.name" class="col-12 col-sm-6">
        <AccountSearch
            v-if="field.type === 'name'"
            v-model="action.data[field.name]"
            emitUpdateOnInput
            outlined
            :filled="false"
            with-validation
            remove-search-icon
            bg-color="white"
            lazy-rules
            :label="field.name"
        />
        <q-input
            v-else-if="field.name === 'quantity'"
            v-model="action.data[field.name]"
            :mask="mask"
            :suffix="symbol"
            fill-mask="0"
            reverse-fill-mask
            outlined
            dense
            hide-bottom-space
            lazy-rules
            :label="field.name"
        />
        <q-input
            v-else
            v-model="action.data[field.name]"
            outlined
            dense
            hide-bottom-space
            lazy-rules
            :label="field.name"
        />
    </div>
</div>

</template>
