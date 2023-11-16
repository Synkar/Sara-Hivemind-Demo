import type { DatetimeTS } from "./Datetime";
import type { LandmarksList } from "./Locality";

export type OperationsType = {
  uuid: string;
  name: string;
  description: string;
  locality: string;
  operationTypes: OperationTypes[];
  client?: string;
};

export type RequestBody = {
  operation: string;
  pickup: {
    params?: {
      [key: string]: string | number | boolean;
    };
    windowTime: [number, number];
    landmark: string;
  };
  delivery: {
    params?: {
      [key: string]: string | number | boolean;
    };
    windowTime: [number, number];
    landmark: string;
  };
  externalId?: string;
};

export type OperationTypes = {
  uuid: string;
  name: string;
  description: string;
  rule?: string;
  orderPriority: number;
};

export type OperationsRetrieve = OperationsType & DatetimeTS;

export type OperationList = {
  uuid: string;
  name: string;
  description: string;
  localitySlug: string;
} & DatetimeTS;

export type RequestRetrieve = {
  uuid: string;
  externalId: string;
  status: "QUEUED" | "ASSIGNED" | "RUNNING" | "FINISHED" | "CANCELLED";
  demand: number;
  operation: {
    uuid: string;
    name: string;
    localitySlug: string;
  };
  robotAssigned?: string | null;
  pickup: {
    status: string;
    landmark: LandmarksList;
    timeWindow: [number, number];
  };
  delivery: {
    status: string;
    landmark: LandmarksList;
    timeWindow: [number, number];
  };
  createdAt: string;
};
