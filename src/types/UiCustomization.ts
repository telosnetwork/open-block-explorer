export interface FooterLink {
    label: string;
    url: string;
}

export interface HeaderSettings {
    hideLoginHandler: boolean;

    hideNetworkTab: boolean;
    hideWalletTab: boolean;
    hideVoteTab: boolean;
    hideProposalTab: boolean;
}

export interface AccountPageSettings {
    hideCpuInfo: boolean;
    hideNetInfo: boolean;
    hideRamInfo: boolean;
    hideRexInfo: boolean;
    hideRefundingInfo: boolean;
    hideDelegatedInfo: boolean;

    hideResourcesControl: boolean;
    hideRexControl: boolean;

    hideTransactionTab: boolean;
    hideTokensTab: boolean;
    hideKeysTab: boolean;
    hideChildrenTab: boolean;
    hideContractsTab: boolean;
}

export interface UiCustomization {
    headerSettings: HeaderSettings;
    accountPageSettings: AccountPageSettings;
}
