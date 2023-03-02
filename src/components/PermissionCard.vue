<script lang="ts">
import { defineComponent, PropType, computed, toRefs } from 'vue';
import { Permission } from 'src/types';
import KeyToggle from 'src/components/KeyToggle.vue';

export default defineComponent({
    name: 'PermissionCard',
    components: { KeyToggle },
    props: {
        permission: {
            type: Object as PropType<Permission>,
            required: true,
        },
        depth: {
            type: Number,
            default: 0,
        },
        isLast: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const { depth, isLast } = toRefs(props);
        const branchTopClass = computed(() =>
            isLast.value ? 'branch-corner' : 'branch-side-top',
        );
        const branchBottomClass = computed(() =>
            isLast.value ? '' : 'branch-side',
        );
        const permissionCardClass = computed(() =>
            depth.value === 0 ? 'owner-permission' : '',
        );
        const permissionLocal = computed(() => {
            const { permission } = toRefs(props);
            return permission.value;
        });
        const formatAccount = (
            name: string,
            type: 'account' | 'transaction' | 'block',
        ): string => `<a href="/${type}/${name}" class="hover-dec">${name}</a>`;

        return {
            branchTopClass,
            branchBottomClass,
            permissionCardClass,
            formatAccount,
            permissionLocal,
        };
    },
});
</script>

<template>
<div v-if="permissionLocal">
    <div class="children row" :class="permissionCardClass">
        <div class="branch column" :class="`${depth > 0 ? '' : 'borderless'}`">
            <div class="col" :class="branchTopClass"></div>
            <div class="col" :class="branchBottomClass"></div>
        </div>
        <q-card class="permission-card col q-mt-md" flat>
            <q-card-section horizontal>
                <q-card-section class="permission-name-section row items-center justify-center">
                    <div class="text-bold">{{`${permissionLocal.perm_name} (${permissionLocal.required_auth.threshold})`}}</div>
                </q-card-section>
                <q-card-section class="permission-key-section">
                    <div v-for="k in permissionLocal.required_auth.keys" :key="k.key.toString()">
                        <KeyToggle :weight="k.weight" :pubkey="k.key"/>
                    </div>
                    <div v-for="a in permissionLocal.required_auth.accounts" :key="`${a.permission.actor}-${a.permission.permission}`">
                        <div><span>{{`+${a.weight} &nbsp; &nbsp; `}}</span><span class="text-bold" v-html="formatAccount(a.permission.actor?.toString(), 'account')"></span><span> @{{a.permission.permission}}</span></div>
                    </div>
                </q-card-section>
                <q-card-section v-if="permissionLocal.permission_links.length > 0" class="permission-action-section">
                    <div v-for="link in permissionLocal.permission_links" :key="link.action">{{link.code}}::{{link.action}}</div>
                </q-card-section>
            </q-card-section>
        </q-card>
    </div>
    <div v-if="permission.children && permission.children.length">
        <div v-for="(p, index) in permissionLocal.children" :key="p.perm_name.toString()">
            <permission-card
                class="permission-card-wrapper"
                :permission="p"
                :depth="depth + 1"
                :isLast="index == permissionLocal.children.length - 1"
            />
        </div>
    </div>
</div>
</template>

<style lang="sass" scoped>
.hover-dec
  text-decoration: none
  color: var(--q-dark)
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
