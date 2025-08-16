export type ItemType = "FOLDER" | "MEMO";

export type Item = {
  id: string;
  type: ItemType;
  name: string;
  path: string;
  updatedAt?: string;
};
