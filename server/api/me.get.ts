import { authToken } from "../utils/authToken";
import prisma from "../utils/prisma";

export default defineEventHandler(async (event) => {
  const jwtBody = await authToken(event);
  if (jwtBody && jwtBody.sub) {
    const user = await prisma.users.findUnique({
      where: {
        id: jwtBody.sub as number,
      },
      select: {
        id: true,
        username: true,
        selectedCredential: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw createError({
        statusCode: 401,
        message: "Unauthorized",
      });
    }
    return {
      user: {
        ...user,
        id: undefined,
        selectedCredential: user.selectedCredential || -1,
      },
    };
  }
  throw createError({
    statusCode: 401,
    message: "Unauthorized",
  });
});
