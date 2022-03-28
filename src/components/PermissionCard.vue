<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Permission } from 'src/types';

export default defineComponent({
  name: 'PermissionCard',
  props: {
    permission: {
      type: Object as PropType<Permission>,
      required: false,
      default: null
    },
    depth: {
      type: Number,
      default: 0
    },
    isLast: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    branchTopClass() {
      return this.isLast ? 'branch-corner' : 'branch-side-top';
    },
    branchBottomClass() {
      return this.isLast ? '' : 'branch-side';
    },
    permissionCardClass() {
      return this.depth == 0 ? 'owner-permission' : '';
    }
  },
  methods: {
    formatAccount(
      name: string,
      type: 'account' | 'transaction' | 'block'
    ): string {
      return `<a href="/${type}/${name}" class="hover-dec">${name}</a>`;
    }
  }
});
</script>

<template lang="pug">
div(v-if="permission" )
    div(:class="permissionCardClass").children.row
        div(:class="`${depth > 0 ? '' : 'borderless'}`").branch.column
            div(:class="branchTopClass").col
            div(:class="branchBottomClass").col
        q-card(flat).permission-card.col.q-mt-md
            q-card-section(horizontal)
                q-card-section.permission-name-section.row.items-center.justify-center
                    div.text-bold {{`${permission.perm_name} (${permission.required_auth.threshold})`}} 
                q-card-section.permission-key-section
                    div(v-for="k in permission.required_auth.keys" :key="k.key") {{`+${k.weight} &nbsp &nbsp ${k.key}`}}
                    div(v-for="a in permission.required_auth.accounts" :key="`${a.permission.actor}-${a.permission.permission}`") 
                        div 
                            span {{`+${a.weight} &nbsp &nbsp `}}
                            span(v-html="formatAccount(a.permission.actor, 'account')").text-bold
                            span  @{{a.permission.permission}}
                q-card-section(v-if="permission.permission_links.length > 0").permission-action-section
                    div(v-for="link in permission.permission_links" :key="link.action") {{link.code}}::{{link.action}}
    div(v-if="permission.children && permission.children.length")
        div(v-for="(p, index) in permission.children" :key="p.perm_name")
            permission-card( :permission="p" :depth="depth + 1" :isLast="index == permission.children.length - 1").permission-card-wrapper
</template>

<style lang="sass" scoped>
.hover-dec
  text-decoration: none
  color: $dark
  &:hover
    text-decoration: underline

.permission-card-wrapper
    margin-left: 50px

.permission-card
    background: #8A65D41A
    .permission-name-section
        background: #8A65D41A
        min-width: 8rem
        flex-shrink: 0

.permission-key-section
  min-width: 10rem
  flex-grow: 1
  flex-shrink: 0

.permission-action-section
  min-width: 10rem
  background: #945eff63

.owner-permission
    .permission-card
        background: #FB5B451A
        .permission-name-section
            background: #FB5B451A
        .permission-action-section
          min-width: 8rem
          background: #fb5b454d

.children
    .branch
        width: 50px
        .branch-corner
            border-left: 2px solid #00000033
            border-bottom: 2px solid #00000033
            border-radius: 0 8px
            margin-left: 20px
        .branch-side-top
            border-bottom: 2px solid #00000033
            border-left: 2px solid #00000033
            margin-left: 20px
        .branch-side
            border-left: 2px solid #00000033
            margin-left: 20px
    .borderless
        .branch-corner,.branch-side-top,.branch-side
            border: none
</style>
