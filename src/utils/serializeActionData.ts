import { Serialize } from 'eosjs';
import { apiEos } from 'src/utils/apiEos';

interface SerializeActionDataProps {
  account: string;
  name: string;
  data: unknown;
}

export async function serializeActionData({
  account,
  name,
  data
}: SerializeActionDataProps): Promise<string> {
  const api = apiEos();
  const contract = await api.getContract(account);

  const serializedData = Serialize.serializeActionData(
    contract,
    account,
    name,
    data,
    api.textEncoder,
    api.textDecoder
  );

  return serializedData;
}
