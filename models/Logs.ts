export type LogActions =
  | "REQUEST_ASSIGNED"
  | "REQUEST_RUNNING"
  | "REQUEST_STAGE_STARTED"
  | "REQUEST_STAGE_FINISHED"
  | "REQUEST_LOCKED"
  | "REQUEST_FINISHED"
  | "REQUEST_CANCELLED"
  | "ROBOT_WAKEUP"
  | "ROBOT_SHUTDOWN"
  | (string & {});

export type RequestAssignedData = {
  requestId: string;
  status: "ASSIGNED";
  [key: string]: unknown;
};

export type RequestRunningData = {
  requestId: string;
  status: "RUNNING";
  [key: string]: unknown;
};

export type RequestStageStartedData = {
  requestId: string;
  requestStage: string;
  nodeType: "PICKUP" | "DELIVERY";
  [key: string]: unknown;
};

export type RequestStageFinishedData = {
  requestId: string;
  requestStage: string;
  nodeType: "PICKUP" | "DELIVERY";
  [key: string]: unknown;
};

export type RequestLockedData = {
  requestId: string;
  status: "RUNNING";
  requestStage: string;
  nodeType: "PICKUP" | "DELIVERY";
  [key: string]: unknown;
};

export type RequestFinishedData = {
  requestId: string;
  status: "FINISHED";
  [key: string]: unknown;
};

export type RequestCancelledData = {
  requestId: string;
  status: "CANCELLED";
  cancelledReason: string;
  [key: string]: unknown;
};

export type RobotWakeupData = {};

export type RobotShutdownData = {};

export type DataUnion =
  | RequestAssignedData
  | RequestRunningData
  | RequestStageStartedData
  | RequestStageFinishedData
  | RequestLockedData
  | RequestFinishedData
  | RequestCancelledData
  | RobotWakeupData
  | RobotShutdownData;
