const blacklist = new Map<string, number>();

export function addTokenToBlacklist(jti: string, expiry: number) {
  blacklist.set(jti, expiry);
}

export function isTokenBlacklisted(jti: string): boolean {
  const expiry = blacklist.get(jti);
  if (!expiry) return false;

  if (Date.now() > expiry) {
    blacklist.delete(jti);
    return false;
  }

  return true;
}
