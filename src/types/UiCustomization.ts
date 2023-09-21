export interface FooterLink {
    label: string;
    url: string;
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
    footerLinks: FooterLink[];
    accountPageSettings: AccountPageSettings;
}
