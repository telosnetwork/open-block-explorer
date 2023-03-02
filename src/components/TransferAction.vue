<template lang="pug">
div(v-if="!!fields").row.q-col-gutter-md
  div(v-for="field in fields" :key="field.name").col-12.col-sm-6
    AccountSearch(
      v-if="field.type === 'name'"
      v-model="action.data[field.name]"
      :label="field.name"
    )
    q-input(
      v-else-if="field.name === 'quantity'"
      :mask="mask"
      :suffix="token"
      fill-mask="0"
      reverse-fill-mask
      outlined
      dense
      hide-bottom-space
      lazy-rules
      v-model="action.data[field.name]"
      :label="field.name"
    )
    q-input(
      v-else
      outlined
      dense
      hide-bottom-space
      lazy-rules
      v-model="action.data[field.name]"
      :label="field.name"
    )
</template>

<script lang="ts">
import {
  defineComponent,
  PropType,
  computed,
  ref,
  watch,
  onMounted
} from 'vue';
import AccountSearch from 'components/AccountSearch.vue';
import { getChain } from 'src/config/ConfigManager';

const chain = getChain();

interface Action {
  account: string;
  name: string;
  authorization: {
    actor: string;
    permission: string;
  }[];
  data: {
    [key: string]: unknown;
  };
}

interface Field {
  name: string;
  type: string;
}

export default defineComponent({
  name: 'TransferAction',
  components: {
    AccountSearch
  },
  props: {
    modelValue: {
      type: Object as PropType<Action>
    },
    fields: {
      type: Object as PropType<Field[]>
    }
  },
  setup(props, context) {
    const action = ref<Action>(props.modelValue);

    const mask = computed(() => {
      const { precision } = chain.getSystemToken();
      let mask = '#';
      if (precision > 0) {
        mask += `.${'#'.repeat(precision)}`;
      }
      return mask;
    });

    const token = computed(() => {
      return chain.getSystemToken().symbol;
    });

    watch(action.value, (currentValue) => {
      if (!(currentValue.data.quantity as string).includes(token.value)) {
        let value = { ...currentValue };
        value.data.quantity = `${currentValue.data.quantity as string} ${
          token.value
        }`;
        context.emit('update:modelValue', value);
      }
    });

    onMounted(() => {
      let newAction = { ...props.modelValue };
      const { precision } = chain.getSystemToken();

      const numberArray =
        (newAction.data.quantity as string).match(/\d+/g) ?? [];

      console.log(numberArray);

      let quantity = '0';
      let fractionPart = '';

      if (numberArray?.length > 0) {
        quantity = numberArray[0] + '.';

        if (numberArray.length >= 2) {
          fractionPart = numberArray[1];
        }
      }
      quantity += fractionPart.slice(0, precision).padEnd(precision, '0');

      console.log(quantity);

      newAction.data.quantity = quantity;

      action.value = newAction;
    });

    return {
      mask,
      token,
      action
    };
  }
});
</script>
