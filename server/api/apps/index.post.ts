import prisma from "~/server/utils/prisma";
import { authToken } from "../../utils/authToken";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const jwtBody = await authToken(event);
  if (jwtBody && jwtBody.sub) {
    const { appId, appSecret } = body as Record<string, string>;

    const user = await prisma.users.findUnique({
      where: {
        id: jwtBody.sub as number,
      },
    });
    if (user) {
      const app = await prisma.credentials.create({
        data: {
          appId,
          appSecret,
          Users: {
            connect: {
              id: user.id,
            },
          },
        },
      });
      if (!user.selectedCredential || user.selectedCredential == -1) {
        await prisma.users.update({
          where: {
            id: user.id,
          },
          data: {
            selectedCredential: app.id,
          },
        });
      }
      return app;
    } else
      throw createError({
        statusCode: 404,
        message: "User not found!",
      });
  } else
    throw createError({
      statusCode: 401,
      message: "Error while deconding token",
    });
});
