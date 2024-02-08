<script lang="ts">
import { useQuasar } from 'quasar';
import { api } from 'src/api';
import { Action, NewAccountData } from 'src/types';
import { defineComponent, onMounted, ref, watch } from 'vue';
export default defineComponent({
    name: 'ChildrenPanel',
    components: {},
    props: {
        account: {
            type: String,
            required: false,
            default: null,
        },
    },
    setup(props) {
        const $q = useQuasar();
        const children = ref<string[]>([]);

        const loadAccountData = async (): Promise<void> => {
            let data: Action[];
            try {
                data = await api.getChildren(props.account);
            } catch (e) {
                $q.notify(`Keys for account ${props.account} not found!`);
                return;
            }
            children.value = data.map(el =>
                formatAccount((el.act.data as NewAccountData).newact, 'account'),
            );
        };
        watch(()=> props.account, async () => {
            children.value = [];
            await loadAccountData();
        });
        // TODO Refactor
        const formatAccount = (
            name: string,
            type: 'account' | 'transaction' | 'block',
        ): string => `<a href="/${type}/${name}" class="hover-dec">${name}</a>`;

        onMounted(async () => {
            await loadAccountData();
        });
        return {
            children,
            loadAccountData,
        };
    },
});
</script>
<template>

<div class="row col-12 q-mt-lg q-mb-xs q-px-xl justify-center text-left container-max-width">
    <p class="panel-title">Children</p>
    <q-space/>
    <q-separator class="row col-12 q-mt-md separator"/>
    <div class="col-12 q-py-lg row">
        <div v-if="children.length == 0 ">No children found</div>
        <div
            v-for="child in children"
            :key="child"
            class="child"
            v-html="child"
        ></div>
    </div>
</div>

</template>

<style lang="sass" scoped>
.hover-dec
  text-decoration: none
  color: var(--q-dark)
  &:hover
    text-decoration: underline

.child
  flex-basis: 10em
  flex-shrink: 0
  line-height: 2em
</style>
