import { axiosHandler } from "~/server/utils/axios";

export default defineEventHandler(async (event) => {
  const axios = await axiosHandler(event);
  const operation = getRouterParam(event, "operation");
  const request = getRouterParam(event, "request");

  try {
    const result = await axios.post(
      `/v1/hivemind/operations/${operation}/requests/${request}/continue`
    );
    if (result && result.status == 202) {
      return true;
    } else return false;
  } catch (e) {
    console.log(e);
    throw createError({
      statusCode: 400,
      message: "Error while retrieving operation",
    });
  }
});
