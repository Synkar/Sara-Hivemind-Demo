import prisma from "~/server/utils/prisma";
import { authToken } from "../../utils/authToken";

export default defineEventHandler(async (event) => {
  const jwtBody = await authToken(event);
  if (jwtBody && jwtBody.sub) {
    const apps = await prisma.credentials.findMany({
      where: {
        usersId: jwtBody.sub as number,
      },
    });
    return apps;
  } else {
    throw createError({
      statusCode: 401,
      message: "Error while decoding token!",
    });
  }
});
