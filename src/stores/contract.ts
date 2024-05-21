import { defineStore } from 'pinia';


export interface ContractStateInterface {
    address: string;
    creator: string;
}


export const useContractStore = defineStore('contract', {
    state: (): ContractStateInterface => ({
        address: '',
        creator: '',
    }),
    getters: {
        getCreatorAddress({ creator }): string {
            return creator;
        },
    },
    actions: {
        setContractAddress(contractAddress: string) {
            this.address = contractAddress;
        },
        setCreator(creatorAddress: string) {
            this.creator = creatorAddress;
        },
        setContract(contractAddress: string) {
            this.setContractAddress(contractAddress);
            this.getContractInfo();
        },
        getContractInfo() {
            const response: { creator: string } = { creator: 'bob' }; //mock
            this.setCreator(response.creator);
        },
    },
});

