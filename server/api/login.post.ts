import { compareText } from "../utils/bcrypt";
import { PrismaClient } from "@prisma/client";
import nJwt from "njwt";
import { addRefreshTokenCookie, addTokenCookie } from "../utils/authToken";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, password } = body as {
    username: string;
    password: string;
  };
  const user = await prisma.users.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
      username: true,
      selectedCredential: true,
      password: true,
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
  const samePassword = await compareText(password, user.password);
  if (!samePassword) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized",
    });
  }
  const config = useRuntimeConfig(event);
  const token = nJwt.create(
    {
      sub: user.id,
    },
    config.JWT_SECRET
  );
  token.setExpiration(new Date().getTime() + 4 * 60 * 60 * 1000);
  const refreshToken = nJwt.create(
    {
      sub: user.id,
    },
    config.JWT_SECRET
  );
  refreshToken.setExpiration(new Date().getTime() + 24 * 60 * 60 * 1000);
  addTokenCookie(event, token.compact());
  addRefreshTokenCookie(event, refreshToken.compact());
  return {
    user: {
      ...user,
      id: undefined,
      password: undefined,
      selectedCredential: user.selectedCredential || -1,
    },
  };
});
