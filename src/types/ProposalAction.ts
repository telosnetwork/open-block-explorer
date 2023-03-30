export interface ProposalAction {
    account: string;
    name: string;
    authorization: {
        actor: string;
        permission: string;
    }[];
    data: {
        [key: string]: string;
    };
}
