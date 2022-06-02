import { Serialize } from 'eosjs';
import { apiEos } from 'src/utils/apiEos';

interface DeserializeActionDataProps {
  account: string;
  name: string;
  hexData: string;
}

export async function deserializeActionData({
  account,
  name,
  hexData
}: DeserializeActionDataProps): Promise<unknown> {
  const api = apiEos();
  const contract = await api.getContract(account);

  const deserializeData = Serialize.deserializeActionData(
    contract,
    account,
    name,
    hexData,
    api.textEncoder,
    api.textDecoder
  ) as unknown;

  return deserializeData;
}
