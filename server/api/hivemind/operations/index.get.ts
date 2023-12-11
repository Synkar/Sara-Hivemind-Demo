import type { PaginatedModel } from "../../../../models/Paginated";
import type { OperationList } from "~/models/Operation";
import { OperationInstance } from "~/server/utils/sarasdk";

/**
 * function to list operations
 */
export default defineEventHandler(async (event) => {
  const operations = await OperationInstance(event);

  try {
    const result = await operations.list({
      limit: "100",
    });
    return result as PaginatedModel<OperationList>;
  } catch (e) {
    console.log(e);
    throw createError({
      statusCode: 400,
      message: "Error while listing operations",
    });
  }
});
