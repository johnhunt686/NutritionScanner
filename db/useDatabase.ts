import {
  getIngredientProfile,
  getPreferences,
  searchIngredientsByName,
  searchIngredientsWithTags,
  searchResearch,
  upsertPreference,
  getAllIngredients,
} from './queries';

export function useDatabase() {
  return {
    searchIngredientsByName,
    searchIngredientsWithTags,
    getIngredientProfile,
    searchResearch,
    upsertPreference,
    getPreferences,
    getAllIngredients,
  };
}