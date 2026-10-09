import { applyReferenceSnapshot, type SyncSnapshot } from '../../db/sync';

export async function syncReferenceData() {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '');

  if (!baseUrl) {
    throw new Error('Set EXPO_PUBLIC_API_URL in the project .env file to use sync.');
  }

  const response = await fetch(`${baseUrl}/sync`, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Sync server returned HTTP ${response.status}.`);
  }

  const snapshot = (await response.json()) as SyncSnapshot;
  await applyReferenceSnapshot(snapshot);

  return {
    ingredients: snapshot.ingredients.length,
    tags: snapshot.tags.length,
    generatedAt: snapshot.generatedAt,
  };
}
