import { defineStore } from "pinia";
import type { LandmarksList } from "~/models/Locality";
4;
import type { RequestBody, RequestRetrieve } from "~/models/Operation";
import type { OperationList, OperationsRetrieve } from "~/models/Operation";

type HivemindState = {
  operations?: OperationList[];
  operation?: OperationsRetrieve;
  landmarks?: LandmarksList[];
  operationSelected?: string;
  request?: RequestRetrieve;
};

export const useHivemind = defineStore("hivemind", {
  state: (): HivemindState => ({
    operations: undefined,
    operation: undefined,
    landmarks: undefined,
    operationSelected: undefined,
    request: undefined,
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
      const token = localStorage.getItem("token");
      const request = await $fetch("/api/hivemind/operations", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      this.operations = request.results;
      return this.operations;
    },
    async retrieveOperation(uuid: string) {
      const token = localStorage.getItem("token");
      const request = await $fetch(`/api/hivemind/operations/${uuid}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      this.operation = request;
      return this.operation;
    },
    async listLandmarks(locality: string) {
      const token = localStorage.getItem("token");
      const request = await $fetch(
        `/api/hivemind/localities/${locality}/landmarks`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      this.landmarks = request.results;
      return this.landmarks;
    },
    async createRequest(body: RequestBody) {
      const token = localStorage.getItem("token");
      const request = await $fetch(
        `/api/hivemind/operations/${body.operation}/request`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body,
        }
      );
      this.request = request;
      return this.request;
    },
  },
});
