import { authToken } from "../../utils/authToken";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const jwtBody = await authToken(event);
  if (jwtBody && jwtBody.sub) {
    const credentials = await prisma.credentials.findUnique({
      where: {
        appId: body.appId,
      },
    });
    if (credentials) {
      const user = prisma.users.update({
        where: {
          id: jwtBody.sub as number,
        },
        data: {
          selectedCredential: credentials.id,
        },
      });
      return user;
    } else
      throw createError({
        statusCode: 404,
        message: "Credential not found!",
      });
  } else
    throw createError({
      statusCode: 401,
      message: "Error while deconding token",
    });
});
