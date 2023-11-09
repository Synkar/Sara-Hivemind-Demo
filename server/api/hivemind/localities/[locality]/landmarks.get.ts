import { LandmarksList } from "~/models/Locality";
import { PaginatedModel } from "~/models/Paginated";
import { axiosHandler } from "~/server/utils/axios";

export default defineEventHandler(async (event) => {
  const axios = await axiosHandler(event);
  const locality = getRouterParam(event, "locality");

  try {
    const result = await axios.get(
      `/v1/hivemind/localities/${locality}/landmarks/?limit=100`
    );
    if (result && result.data) {
      const response = result.data as PaginatedModel<LandmarksList>;
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
