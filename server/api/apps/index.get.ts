import { authToken } from "../../utils/authToken";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * function to retrieve a client app credential
 */
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
