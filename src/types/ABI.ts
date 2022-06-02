export interface ABI {
  abi: {
    actions: Action[];
    structs: Struct[];
    tables: Table[];
  } | null;
  account_name: string;
}

interface Action {
  name: string;
  ricardian_contract: string;
  type: string;
}

interface Table {
  index_type: string;
  key_names: unknown[];
  key_types: unknown[];
  name: string;
  type: string;
}

interface Struct {
  base: string;
  fields: Field[];
  name: string;
}

interface Field {
  name: string;
  type: string;
}
