import { RouteRecordRaw } from 'vue-router';

const isMultichain = process.env.SHOW_MULTICHAIN_SELECTOR === 'true';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'home',
        component: () => import('pages/Home.vue'),
        beforeEnter:(to, from, next) => {
            if (!isMultichain) {
                next('/network');
            } else {
                next();
            }
        },
    },
    {
        path: '/account/:account',
        name: 'account',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            {
                path: '',
                component: () => import('pages/Account.vue'),
            },
        ],
    },
    {
        path: '/transaction/:transaction',
        name: 'transaction',
        component: () => import('layouts/MainLayout.vue'),
        children: [{ path: '', component: () => import('src/pages/TransactionPage.vue') }],
    },
    {
        path: '/block/:block',
        name: 'block',
        component: () => import('layouts/MainLayout.vue'),
        children: [{ path: '', component: () => import('pages/Block.vue') }],
    },
    {
        path: '/network',
        name: 'network',
        component: () => import('layouts/MainLayout.vue'),
        children: [{ path: '', component: () => import('pages/Network.vue') }],
    },
    {
        path: '/vote',
        name: 'vote',
        component: () => import('layouts/MainLayout.vue'),
        children: [{ path: '', component: () => import('pages/Vote.vue') }],
    },
    {
        path: '/proposal',
        name: 'proposal',
        component: () => import('layouts/MainLayout.vue'),
        children: [{ path: '', component: () => import('pages/Proposal.vue') }],
    },
    {
        path: '/proposal/new',
        name: 'ProposalNew',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            { path: '', component: () => import('src/pages/ProposalNew.vue') },
        ],
    },
    {
        path: '/proposal/:proposalName',
        name: 'ProposalItem',
        component: () => import('layouts/MainLayout.vue'),
        children: [{ path: '', component: () => import('pages/ProposalItem.vue') }],
    },
    {
        path: '/explore',
        name: 'explore',
        component: () => import('layouts/MainLayout.vue'),
        children: [{ path: '', component: () => import('pages/Explore.vue') }],
    },
    {
        path: '/repository',
        name: 'repository',
        component: () => import('layouts/MainLayout.vue'),
        children: [{ path: '', component: () => import('pages/Repository.vue') }],
    },
    {
        path: '/key/:key',
        name: 'key',
        component: () => import('layouts/MainLayout.vue'),
        children: [{ path: '', component: () => import('pages/Key.vue') }],
    },
    // Always leave this as last one,
    // but you can also remove it
    {
        path: '/:catchAll(.*)*',
        component: () => import('layouts/MainLayout.vue'),
        children: [{ path: '', component: () => import('pages/Error404.vue') }],
    },
];

export default routes;
