import prisma from "~/server/utils/prisma";
import { authToken } from "../../utils/authToken";

export default defineEventHandler(async (event) => {
  const app = getRouterParam(event, "app");
  const jwtBody = await authToken(event);
  if (jwtBody && jwtBody.sub && app) {
    const user = await prisma.users.findUnique({
      where: {
        id: jwtBody.sub as number,
      },
    });
    const deleted = await prisma.credentials.delete({
      where: {
        appId: app,
      },
    });
    if (user?.selectedCredential == deleted.id) {
      await prisma.users.update({
        where: {
          id: jwtBody.sub as number,
        },
        data: {
          selectedCredential: -1,
        },
      });
    }
    if (deleted) return true;
    else return false;
  } else {
    throw createError({
      statusCode: 401,
      message: "Error while decoding token!",
    });
  }
});
