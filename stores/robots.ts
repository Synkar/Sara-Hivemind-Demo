type State = {
  robots: {
    uuid: string;
    name: string;
  }[];
};

export const useRobots = defineStore("robots", {
  state: (): State => ({
    robots: [],
  }),
  actions: {
    async getRobotName(uuid: string) {
      const robot = this.robots.find((r) => {
        return r.uuid == uuid;
      });
      if (robot) return robot.name;
      else {
        try {
          const request = await $fetch(`/api/iam/robots/${uuid}`, {
            method: "GET",
          });
          this.robots.push({
            uuid: request.uuid,
            name: request.name,
          });
          return request.name;
        } catch (e) {
          throw e;
        }
      }
    },
  },
});
