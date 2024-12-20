import prisma from "~/server/utils/prisma";
import { authToken } from "../../utils/authToken";

export default defineEventHandler(async (event) => {
  const jwtBody = await authToken(event);
  if (jwtBody && jwtBody.sub) {
    const user = await prisma.users.findUnique({
      where: {
        id: jwtBody.sub as number,
      },
    });
    if (user && user.selectedCredential) {
      const app = await prisma.credentials.findUnique({
        where: {
          id: user.selectedCredential,
        },
      });
      if (!app)
        throw createError({
          statusCode: 404,
          message: "Selected Credential not Found!",
        });
      return app;
    } else {
      throw createError({
        statusCode: 404,
        message: "Selected Credential not Found!",
      });
    }
  } else {
    throw createError({
      statusCode: 401,
      message: "Error while deconding token!",
    });
  }
});
