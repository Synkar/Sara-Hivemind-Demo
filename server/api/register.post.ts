import { hashText } from "../utils/bcrypt";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, password } = body as Record<string, string>;
  const hashedPassword = await hashText(password);
  try {
    const user = await prisma.users.create({
      data: {
        username,
        password: hashedPassword,
      },
    });
    return {
      ...user,
      password: undefined,
      id: undefined,
    };
  } catch (e) {
    throw createError({
      statusCode: 400,
      message: "Please verify your information and try again!",
    });
  }
});
