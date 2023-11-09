import { axiosHandler } from "~/server/utils/axios";
import { RequestBody, RequestRetrieve } from "~/models/Operation";

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as RequestBody;
  console.log(body);
  const axios = await axiosHandler(event);
  const operation = getRouterParam(event, "operation");

  try {
    const result = await axios.post(
      `/v1/hivemind/operations/${operation}/requests/`,
      body
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
