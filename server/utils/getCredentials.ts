import nJwt from "njwt";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 *
 * @param tokenDecoded
 * @returns Credentials
 * @description
 * This function is used to get the credentials of the user.
 * It uses the tokenDecoded to get the user id.
 * Then it uses the prisma client to get the user.
 * If the user has a selectedCredential it will return that credential.
 * If the user doesn't have a selectedCredential it will return the first credential.
 * If the user doesn't have any credentials it will throw an error.
 * If the user doesn't exist it will throw an error.
 * If the token is invalid it will throw an error.
 * @throws {Error} Credentials Not Found!
 * @throws {Error} User not found!
 * @throws {Error} Invalid Token Format
 * @example
 * const credentials = await getCredentials(tokenDecoded);
 *
 */
export async function getCredentials(tokenDecoded: nJwt.JSONMap) {
  if (tokenDecoded && tokenDecoded.sub) {
    const user = await prisma.users.findUnique({
      where: {
        id: tokenDecoded.sub as number,
      },
    });
    if (user) {
      if (user.selectedCredential) {
        const app = await prisma.credentials.findUnique({
          where: {
            id: user.selectedCredential,
          },
        });
        if (!app) {
          throw createError({
            statusCode: 404,
            message: "Credentials Selected Not Found!",
          });
        }
        return app;
      } else {
        const app = await prisma.credentials.findFirst({
          where: {
            Users: {
              is: {
                username: {
                  equals: user.username,
                },
              },
            },
          },
        });
        if (!app) {
          throw createError({
            statusCode: 404,
            message: "Credentials Not Found!",
          });
        }
        return app;
      }
    } else {
      throw createError({
        statusCode: 404,
        message: "User not found!",
      });
    }
  } else {
    throw createError({
      statusCode: 400,
      message: "Invalid Token Format",
    });
  }
}
