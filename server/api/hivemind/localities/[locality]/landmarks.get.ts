import { LandmarksList } from "~/models/Locality";
import { PaginatedModel } from "~/models/Paginated";
import { axiosHandler } from "~/server/utils/axios";

/**
 * function to list landmarks from a locality
 * returns a paginated list of landmarks
 */
export default defineEventHandler(async (event) => {
  const axios = await axiosHandler(event);
  const locality = getRouterParam(event, "locality");
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
      `/v1/hivemind/localities/${locality}/landmarks/${str}`
    );
    if (result && result.data) {
      const response = result.data as PaginatedModel<LandmarksList>;
      return response;
    }
  } catch (e) {
    console.log(e);
    throw createError({
      statusCode: 400,
      message: "Error while retrieving landmarks",
    });
  }
});
