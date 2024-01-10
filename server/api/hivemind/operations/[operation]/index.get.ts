import type { OperationsRetrieve } from "~/models/Operation";
import { OperationInstance } from "~/server/utils/sarasdk";

/**
 * function to retrieve an operation
 */
export default defineEventHandler(async (event) => {
  const operation = getRouterParam(event, "operation");
  if (operation) {
    const operations = await OperationInstance(event);

    try {
      const result = (await operations.retrieve(
        operation
      )) as unknown as OperationsRetrieve;
      return result;
    } catch (e) {
      console.log(e);
      throw createError({
        statusCode: 400,
        message: "Error while retrieving operation",
      });
    }
  } else
    throw createError({
      statusCode: 400,
      message: "You need to provide a operation uuid",
    });
});
