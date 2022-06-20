import { Api, JsonRpc } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';

interface AnchorLinkList {
  auth: {
    actor: string;
    permission: string;
  };
  chainId: string;
}

export function apiEos() {
  const [userLogged] = JSON.parse(
    localStorage.getItem('anchor-link--list')
  ) as AnchorLinkList[];

  const localStorageName = `anchor-link--${userLogged.auth.actor}@${userLogged.auth.permission}-${userLogged.chainId}`;

  const {
    data: { requestKey }
  } = JSON.parse(localStorage.getItem(localStorageName)) as {
    data: {
      requestKey: string;
    };
  };

  const signatureProvider = new JsSignatureProvider([requestKey]);
  const rpc = new JsonRpc(process.env.HYPERION_ENDPOINT);
  const api = new Api({
    rpc,
    signatureProvider,
    textDecoder: new TextDecoder(),
    textEncoder: new TextEncoder()
  });

  return api;
}
