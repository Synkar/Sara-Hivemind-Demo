import { RobotsInstance } from "~/server/utils/sarasdk";

export default defineEventHandler(async (event) => {
  const robot = getRouterParam(event, "robot");
  if (robot) {
    const robots = await RobotsInstance(event);

    try {
      const result = await robots.retrieve(robot);
      return result;
    } catch (e) {
      console.log(e);
      throw createError({
        statusCode: 400,
        message: "Error while retrieving robot",
      });
    }
  } else
    throw createError({
      statusCode: 400,
      message: "You need to provide a robot uuid",
    });
});
