import { genSalt, hash, compare } from "bcrypt";

/**
 * This file is a wrapper for the bcrypt library.
 * It's purpose is to provide a single point for all bcrypt functions.
 */

/**
 * @param text string
 * @returns hashed string
 * @description
 * This function is used to hash a string.
 * It uses the bcrypt library to hash the string.
 * @example
 * const hashed = await hashText("Hello World!");
 * console.log(hashed);
 */
export const hashText = async (text: string) => {
  const salt = await genSalt(10);
  const hashed = await hash(text, salt);
  return hashed;
};

/**
 * @param text string
 * @param hashed string
 * @returns boolean
 * @description
 * This function is used to compare a string with a hashed string.
 * It uses the bcrypt library to compare the string with the hashed string.
 * @example
 * const isMatch = await compareText("Hello World!", hashed);
 * console.log(isMatch);
 */
export const compareText = async (text: string, hashed: string) => {
  const isMatch = await compare(text, hashed);
  return isMatch;
};
