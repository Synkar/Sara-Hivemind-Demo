import { axiosHandler } from "~/server/utils/axios";
import { RequestRetrieve } from "~/models/Operation";
import { PaginatedModel } from "~/models/Paginated";

/**
 * function to list requests from an operation
 * returns a paginated list of requests
 */
export default defineEventHandler(async (event) => {
  const axios = await axiosHandler(event);
  const operation = getRouterParam(event, "operation");
  const query = getQuery(event);

  const str =
    "?" +
    Object.keys(query)
      .map((key) => {
        return `${key}=${encodeURIComponent(query[key] as string)}`;
      })
      .join("&");

  try {
    const result = await axios.get(
      `/v1/hivemind/operations/${operation}/requests/${str}`
    );
    if (result && result.data) {
      const response = result.data as PaginatedModel<RequestRetrieve>;
      return response;
    }
  } catch (e) {
    console.log(e);
    throw createError({
      statusCode: 400,
      message: "Error while listing requests",
    });
  }
});
