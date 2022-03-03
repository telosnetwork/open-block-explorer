export function encodeParam(str: string) {
  return encodeURIComponent(str).replace(/[\.!'()*]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16);
  });
}

export function decodeParam(str: string) {
  const decoded = decodeURIComponent(str);
  decoded.replace(/%2e/g, '.');
  return decoded;
}
