import { customAlphabet } from "nanoid";
export const makeId = (prefix: string = "id") => {
  const nano = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 8);
  return `${prefix}-${nano()}`;
};
