import {
  getIngredientProfile,
  getPreferences,
  searchIngredientsByName,
  searchIngredientsWithTags,
  searchResearch,
  upsertPreference,
} from './queries';

export function useDatabase() {
  return {
    searchIngredientsByName,
    searchIngredientsWithTags,
    getIngredientProfile,
    searchResearch,
    upsertPreference,
    getPreferences,
  };
}