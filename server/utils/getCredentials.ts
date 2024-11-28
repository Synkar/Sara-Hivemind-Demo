import nJwt from "njwt";
import prisma from "./prisma";

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
