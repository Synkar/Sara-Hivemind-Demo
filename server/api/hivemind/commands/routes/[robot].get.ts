import { axiosHandler } from "~/server/utils/axios";

export default defineEventHandler(async (event) => {
  const axios = await axiosHandler(event);
  const robot = getRouterParam(event, "robot");

  try {
    const result = await axios.get(`/v1/hivemind/commands/routes/${robot}`);
    if (result && result.data) {
      const response = result.data as any;
      return response;
    }
  } catch (e) {
    console.log(e);
    throw createError({
      statusCode: 400,
      message: "Error while retrieving operation",
    });
  }
});
