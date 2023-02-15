<script lang="ts">
import { Permission, PermissionLinks } from 'src/types';
import PermissionCard from 'components/PermissionCard.vue';
import { computed, defineComponent, onMounted, ref } from 'vue';
import { api } from 'src/api';
import { useQuasar } from 'quasar';
import { API } from '@greymass/eosio';

export default defineComponent({
  name: 'KeysPanel',
  components: {
    PermissionCard,
  },
  props: {
    account: {
      type: String,
      required: false,
      default: null,
    },
  },
  setup(props) {
    const account = computed(() => props.account);
    const permission = ref<Permission>(null);
    const $q = useQuasar();
    const loadAccountData = async (): Promise<void> => {
      let data: API.v1.AccountObject;
      try {
        data = await api.getAccount(account.value);
      } catch (e) {
        $q.notify(`Keys for account ${account.value} not found!`);
        return;
      }
      const permissions = data.permissions as Permission[];
      let links: PermissionLinks[];
      try {
        links = await api.getPermissionLinks(account.value);
      } catch (e) {
        $q.notify(`Permission links for account ${account.value} not found!`);
        return;
      }
      for (let p of permissions) {
        p['permission_links'] = links.filter(
          (l) => l.permission == p.perm_name.toString(),
        );
      }

      permission.value = sortPermissions(permissions);
    };
    const sortPermissions = (perm: Permission[]) => {
      let result: Permission;
      result = perm.find((p) => p.perm_name.toString() === 'owner');
      perm = perm.filter((p) => p.perm_name.toString() !== 'owner');

      const getChildren = (parent: Permission, perms: Permission[]) => {
        // Get children
        let children = perms.filter(
          (p) => p.parent.toString() === parent.perm_name.toString(),
        );
        // Set children's children
        for (let child of children) {
          child.children = getChildren(child, perms);
        }
        return children;
      };

      result.children = getChildren(result, perm);
      return result;
    };
    onMounted(() => {
      void loadAccountData();
    });
    return {
      permission,
    };
  },
});
</script>
<template lang="pug">
div.row.col-12.q-my-xs.justify-center.text-left
    div.row.col-11
      div.row.col-12.q-mt-lg
          div
              p.panel-title Keys and Permissions
          q-space
      q-separator.row.col-12.q-mt-md.separator
      .permissions-container.col-12.q-py-lg
        permission-card(v-if='permission' :permission="permission" :depth="0").permissions

</template>
<style lang="sass" scoped>
.permissions-container
  overflow-x: auto
  display: flex
  @media screen and (min-width: 900px) //screen > medium
    justify-content: center

.permissions
  flex-shrink: 0
</style>
