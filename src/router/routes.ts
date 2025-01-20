import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'home',
        meta: {
            needsNetwork: true,
        },
        component: () => import('pages/Home.vue'),
    },
    {
        path: '/account/:account',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            {
                path: '',
                name: 'account',
                component: () => import('pages/Account.vue'),
            },
        ],
    },
    {
        path: '/transaction/:transaction',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            {
                path: '',
                name: 'transaction',
                component: () => import('src/pages/TransactionPage.vue'),
            },
        ],
    },
    {
        path: '/block/:block',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            {
                path: '',
                name: 'block',
                component: () => import('pages/Block.vue'),
            },
        ],
    },
    {
        path: '/network',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            {
                path: '',
                name: 'network',
                component: () => import('pages/Network.vue'),
            },
        ],
    },
    {
        path: '/vote',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            {
                path: '',
                name: 'vote',
                component: () => import('pages/Vote.vue'),
            },
        ],
    },
    {
        path: '/proposal',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            {
                path: '',
                name: 'proposal',
                component: () => import('pages/Proposal.vue'),
            },
        ],
    },
    {
        path: '/proposal/new',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            {
                path: '',
                name: 'ProposalNew',
                component: () => import('src/pages/ProposalNew.vue'),
            },
        ],
    },
    {
        path: '/proposal/:proposalName',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            {
                path: '',
                name: 'ProposalItem',
                component: () => import('pages/ProposalItem.vue'),
            },
        ],
    },
    {
        path: '/explore',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            {
                path: '',
                name: 'explore',
                component: () => import('pages/Explore.vue'),
            },
        ],
    },
    {
        path: '/repository',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            {
                path: '',
                name: 'repository',
                component: () => import('pages/Repository.vue'),
            },
        ],
    },
    {
        path: '/key/:key',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            {
                path: '',
                name: 'key',
                component: () => import('pages/Key.vue'),
            },
        ],
    },
    // Always leave this as last one,
    // but you can also remove it
    {
        path: '/:catchAll(.*)*',
        component: () => import('layouts/MainLayout.vue'),
        children: [
            {
                path: '',
                component: () => import('pages/Error404.vue'),
            },
        ],
    },
];

export default routes;
