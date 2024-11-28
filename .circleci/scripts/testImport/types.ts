export enum requestMethods {
  GET = "get",
  PUT = "put",
  POST = "post",
  DELETE = "delete",
  PATCH = "patch",
}

export type makeRequestToSnykArgs = {
  method: requestMethods;
  endpoint: string;
  body?: any | null;
  requestId?: string;
};

export type pollRequestToSnykArgs = makeRequestToSnykArgs & {
  successFunction: Function;
  failFunction: Function;
  wait: number;
  attempts: number;
};

export type snykClientArgs = {
  endpoint: string;
  poll?: boolean;
  body?: any | null;
  successFunction?: Function;
  failFunction?: Function;
  wait?: number;
  attempts?: number;
};

export type importDataTargetSpec = {
  orgId: string;
  integrationId: string;
  target: Object;
};

export type snykRequestHeaders = {
  Authorization: string;
  "Content-Type": string;
  "snyk-request-id"?: string;
};
