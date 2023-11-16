import { axiosHandler } from "~/server/utils/axios";
import { RequestRetrieve } from "~/models/Operation";

export default defineEventHandler(async (event) => {
  const axios = await axiosHandler(event);
  const operation = getRouterParam(event, "operation");
  const request = getRouterParam(event, "request");

  try {
    const result = await axios.delete(
      `/v1/hivemind/operations/${operation}/requests/${request}`
    );
    if (result && result.data) {
      const response = result.data as RequestRetrieve;
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
