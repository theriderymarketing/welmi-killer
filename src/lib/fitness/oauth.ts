import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';

export type OAuthConfig = {
  providerId: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  refreshEndpoint?: string;
  clientId: string;
  clientSecret?: string;
  scopes: string[];
  usePKCE?: boolean;
  extraAuthParams?: Record<string, string>;
};

export type OAuthToken = {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // epoch ms
  raw: unknown;
};

const KEY = (id: string) => `oauth.${id}`;

export async function authorize(cfg: OAuthConfig): Promise<OAuthToken> {
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'welmikiller',
    path: `oauth/${cfg.providerId}`
  });

  const request = new AuthSession.AuthRequest({
    clientId: cfg.clientId,
    scopes: cfg.scopes,
    redirectUri,
    usePKCE: cfg.usePKCE ?? true,
    extraParams: cfg.extraAuthParams
  });

  const result = await request.promptAsync({ authorizationEndpoint: cfg.authorizationEndpoint });
  if (result.type !== 'success' || !result.params.code) {
    throw new Error(`oauth_failed_${cfg.providerId}`);
  }

  const params: Record<string, string> = {
    grant_type: 'authorization_code',
    code: result.params.code,
    redirect_uri: redirectUri,
    client_id: cfg.clientId
  };
  if (cfg.clientSecret) params.client_secret = cfg.clientSecret;
  if (request.codeVerifier) params.code_verifier = request.codeVerifier;

  const r = await fetch(cfg.tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params).toString()
  });
  if (!r.ok) throw new Error(`token_exchange_failed_${cfg.providerId}_${r.status}`);
  const json = (await r.json()) as { access_token: string; refresh_token?: string; expires_in?: number };

  const token: OAuthToken = {
    accessToken: json.access_token,
    refreshToken: json.refresh_token,
    expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
    raw: json
  };
  await SecureStore.setItemAsync(KEY(cfg.providerId), JSON.stringify(token));
  return token;
}

export async function getValidToken(cfg: OAuthConfig): Promise<OAuthToken | null> {
  const raw = await SecureStore.getItemAsync(KEY(cfg.providerId));
  if (!raw) return null;
  const token = JSON.parse(raw) as OAuthToken;
  if (token.expiresAt > Date.now() + 60_000) return token;
  return refresh(cfg, token);
}

async function refresh(cfg: OAuthConfig, token: OAuthToken): Promise<OAuthToken | null> {
  if (!token.refreshToken) return null;
  const params: Record<string, string> = {
    grant_type: 'refresh_token',
    refresh_token: token.refreshToken,
    client_id: cfg.clientId
  };
  if (cfg.clientSecret) params.client_secret = cfg.clientSecret;

  const r = await fetch(cfg.refreshEndpoint ?? cfg.tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params).toString()
  });
  if (!r.ok) return null;
  const json = (await r.json()) as { access_token: string; refresh_token?: string; expires_in?: number };
  const updated: OAuthToken = {
    accessToken: json.access_token,
    refreshToken: json.refresh_token ?? token.refreshToken,
    expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
    raw: json
  };
  await SecureStore.setItemAsync(KEY(cfg.providerId), JSON.stringify(updated));
  return updated;
}

export async function revoke(providerId: string): Promise<void> {
  await SecureStore.deleteItemAsync(KEY(providerId));
}
