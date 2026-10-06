export type PreferenceType = 'ingredient' | 'tag';

export type PreferenceRecord = {
  preferenceId: number;
  alert: boolean;
  ingredientId: number | null;
  formalName: string | null;
  tagId: number | null;
  tagName: string | null;
  tagColor: string | null;
};

export type IngredientOption = {
  id: number;
  formalName: string;
  commonName: string | null;
};

export type TagOption = {
  id: number;
  name: string;
  color: string | null;
};

export type PickerOption = {
  id: number;
  name?: string | null;
  formalName?: string | null;
  commonName?: string | null;
  color?: string | null;
};

export type PreferenceRowProps = {
  label: string;
  type: PreferenceType;
  value: boolean;
  onValueChange: (value: boolean) => void;
  onDelete: () => void;
};
