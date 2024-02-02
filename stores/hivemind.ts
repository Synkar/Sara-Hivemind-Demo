import { defineStore } from "pinia";
import type { LandmarksList } from "~/models/Locality";
4;
import type { RequestBody, RequestRetrieve } from "~/models/Operation";
import type { OperationList, OperationsRetrieve } from "~/models/Operation";
import type { PaginatedModel } from "~/models/Paginated";

type HivemindState = {
  operations?: OperationList[];
  operation?: OperationsRetrieve;
  pickups?: PaginatedModel<LandmarksList>;
  deliveries?: PaginatedModel<LandmarksList>;
  operationSelected?: string;
  request?: RequestRetrieve;
  requests?: PaginatedModel<RequestRetrieve>;
  externalId: number;
  routes?: any;
};

export const useHivemind = defineStore("hivemind", {
  state: (): HivemindState => ({
    operations: undefined,
    operation: undefined,
    pickups: undefined,
    deliveries: undefined,
    operationSelected: undefined,
    request: undefined,
    requests: undefined,
    externalId: 0,
    routes: undefined,
  }),
  actions: {
    setOperationSelected(uuid: string) {
      if (process.client) {
        localStorage.setItem("operation", uuid);
      }
      this.operationSelected = uuid;
    },
    getOperationSelected() {
      if (this.operationSelected) return this.operationSelected;
      else {
        if (process.client) {
          const operation = localStorage.getItem("operation");
          if (operation) {
            this.operationSelected = operation;
            return operation;
          }
        }
      }
      return "";
    },
    async listOperations() {
      const request = await $fetch("/api/hivemind/operations", {
        method: "GET",
      });
      this.operations = request.results;
      return this.operations;
    },
    async retrieveOperation(uuid: string) {
      const request = await $fetch(`/api/hivemind/operations/${uuid}`, {
        method: "GET",
      });
      this.operation = request;
      return this.operation;
    },
    async listPickups(
      locality: string,
      limit = 10,
      page = 1,
      sortBy?: string,
      sort: "asc" | "desc" = "asc"
    ) {
      const request = await $fetch(
        `/api/hivemind/localities/${locality}/landmarks`,
        {
          method: "GET",
          query: {
            limit,
            page,
            sortBy,
            sort,
          },
        }
      );
      this.pickups = request;
      return this.pickups;
    },
    async listDeliveries(
      locality: string,
      limit = 10,
      page = 1,
      sortBy?: string,
      sort: "asc" | "desc" = "asc"
    ) {
      const request = await $fetch(
        `/api/hivemind/localities/${locality}/landmarks`,
        {
          method: "GET",
          query: {
            limit,
            page,
            sortBy,
            sort,
          },
        }
      );
      this.deliveries = request;
      return this.deliveries;
    },
    async createRequest(body: RequestBody) {
      const request = await $fetch(
        `/api/hivemind/operations/${body.operation}/requests/`,
        {
          method: "POST",
          body,
        }
      );
      this.request = request;
      return this.request;
    },
    async listRequests(operation: string, page = 1, limit = 10) {
      const request = await $fetch(
        `/api/hivemind/operations/${operation}/requests`,
        {
          method: "GET",
          query: {
            page,
            limit,
          },
        }
      );
      this.requests = request;
      return this.requests;
    },
    async cancelRequest(operation: string, requestUuid: string) {
      try {
        await $fetch(
          `/api/hivemind/operations/${operation}/requests/${requestUuid}`,
          {
            method: "DELETE",
          }
        );
        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    },
    async continueRequest(operation: string, requestUuid: string) {
      try {
        const request = await $fetch(
          `/api/hivemind/operations/${operation}/requests/${requestUuid}/continue`,
          {
            method: "POST",
          }
        );
        return request;
      } catch (e) {
        console.log(e);
        return false;
      }
    },
    async listRoutes(robot: string) {
      try {
        const request = await $fetch(`/api/hivemind/commands/routes/${robot}`, {
          method: "GET",
        });
        this.routes = request;
        return request;
      } catch (e) {
        console.log(e);
      }
    },
    setExternalId(i: number) {
      this.externalId = i;
      localStorage.setItem("externalId", this.externalId.toString());
    },
    getExternalId() {
      const i = localStorage.getItem("externalId");
      if (i) {
        this.externalId = parseInt(i);
        return this.externalId;
      } else {
        return this.externalId;
      }
    },
    incrementExternalId() {
      const i = this.getExternalId();
      this.externalId = i + 1;
      this.setExternalId(this.externalId);
      return this.externalId;
    },
  },
});
