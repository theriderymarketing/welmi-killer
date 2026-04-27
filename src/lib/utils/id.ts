import * as SecureStore from 'expo-secure-store';
import { randomUUID } from 'expo-crypto';

const KEY = 'welmi.userId';

/** Anonymous local user — no auth, no cloud accounts. */
export async function getOrCreateUserId(): Promise<string> {
  let id = await SecureStore.getItemAsync(KEY);
  if (!id) {
    id = randomUUID();
    await SecureStore.setItemAsync(KEY, id);
  }
  return id;
}
