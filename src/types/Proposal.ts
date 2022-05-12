export interface GetProposalsProps {
  proposer?: string;
  proposal?: string;
  requested?: string;
  provided?: string;
  limit?: number;
  skip?: number;
}

export interface GetProposals {
  proposals: {
    block_num: number;
    executed: false;
    primary_key: string;
    proposal_name: string;
    proposer: string;
    provided_approvals: {
      actor: string;
      permission: string;
      time: string;
    }[];
    requested_approvals: {
      actor: string;
      permission: string;
      time: string;
    }[];
  }[];
  total: {
    value: number;
  };
}

export interface ProposalTableRow {
  primaryKey: string;
  proposalName: string;
  approvalStatus: string;
  proposer: string;
  isSigned?: boolean;
}

export interface ProposalForm {
  proposer: string;
  proposal_name: string;

  requested: {
    actor: string;
    permission: string;
  }[];

  trx: {
    expiration: string;
    ref_block_num: number;
    ref_block_prefix: number;
    max_net_usage_words: number;
    max_cpu_usage_ms: number;
    delay_sec: number;
    context_free_actions: string[];
    transaction_extensions: string[];

    actions: {
      account: string;
      name: string;
      from: string;
      to: string;
      quantity: string;
      memo: string;
      authorization: {
        actor: string;
        permission: string;
      }[];
      data: string;
    }[];
  };
}
