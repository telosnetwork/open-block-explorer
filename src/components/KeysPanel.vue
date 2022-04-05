<script lang="ts">
import { AccountDetails, Permission, PermissionLinks } from 'src/types';
import PermissionCard from 'components/PermissionCard.vue';
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'KeysPanel',
  components: {
    PermissionCard
  },
  props: {
    account: {
      type: String,
      required: false,
      default: null
    }
  },
  data() {
    return {
      permission: null
    };
  },
  async mounted() {
    await this.loadAccountData();
  },
  methods: {
    async loadAccountData(): Promise<void> {
      let data: AccountDetails;
      try {
        data = await this.$api.getAccount(this.account);
      } catch (e) {
        this.$q.notify(`Keys for account ${this.account} not found!`);
        return;
      }
      const permissions = data.account.permissions;
      let links: PermissionLinks[];
      try {
        links = await this.$api.getPermissionLinks(this.account);
      } catch (e) {
        this.$q.notify(
          `Permission links for account ${this.account} not found!`
        );
        return;
      }
      for (let p of permissions) {
        p.permission_links = links.filter((l) => l.permission == p.perm_name);
      }

      this.permission = this.sortPermissions(permissions);
    },
    sortPermissions(permissions: Permission[]) {
      let result: Permission;
      result = permissions.find((p) => p.perm_name === 'owner');
      permissions = permissions.filter((p) => p.perm_name !== 'owner');

      const getChildren = (parent: Permission, perms: Permission[]) => {
        // Get children
        let children = perms.filter((p) => p.parent === parent.perm_name);
        // Set children's children
        for (let child of children) {
          child.children = getChildren(child, perms);
        }
        return children;
      };

      result.children = getChildren(result, permissions);
      return result;
    }
  }
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
        permission-card(:permission="permission" :depth="0").permissions

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
