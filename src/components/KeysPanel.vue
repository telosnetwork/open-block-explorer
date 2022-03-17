<script lang="ts">
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { AccountDetails, Permission } from 'src/types';
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
        console.log(data);
      } catch (e) {
        this.$q.notify(`Keys for account ${this.account} not found!`);
        return;
      }
      const permissions = data.account.permissions;
      // console.log(permissions);
      this.permission = this.sortPermissions(permissions);
    },
    sortPermissions(permissions: Permission[]) {
      let result: Permission;
      result = permissions.find((p) => p.perm_name === 'owner');
      permissions = permissions.filter((p) => p.perm_name !== 'owner');

      const getChildren = (parent: Permission, perms: Permission[]) => {
        // Get children
        let children = perms.filter((p) => p.parent === parent.perm_name);
        // console.log(children);
        // Set children's children
        for (let child of children) {
          child.children = getChildren(child, perms);
        }
        return children;
      };

      result.children = getChildren(result, permissions);
      // console.log(result);
      return result;
    }
  }
});
</script>
<template lang="pug">
div.row.col-12.q-my-xs.justify-center.text-left
    div.row.col-11
        div.row.col-12.q-mt-lg
            div.col-3
                p.table-title Keys and Permissions 
            q-space
        q-separator.row.col-12.q-mt-md.separator
        div.row.col-12.justify-center.q-my-lg
          permission-card(:permission="permission" :depth="0").permissions

</template>
<style lang="sass">
body
  height:1000px

.hover-dec
  text-decoration: none
  color: $dark
  &:hover
    text-decoration: underline

.permissions
  min-width: 800px
</style>
