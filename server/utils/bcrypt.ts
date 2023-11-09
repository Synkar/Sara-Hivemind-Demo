import { genSalt, hash, compare } from "bcrypt";

export const hashText = async (text: string) => {
  const salt = await genSalt(10);
  const hashed = await hash(text, salt);
  return hashed;
};

export const compareText = async (text: string, hashed: string) => {
  const isMatch = await compare(text, hashed);
  return isMatch;
};
