import makeLog from "./logger";
import * as types from "./types";
import { randomUUID } from "node:crypto";
const logger = new makeLog();

export default class snykApiClient {
  constructor(snykAPIBase: string, snykToken: string) {
    this.snykAPIBase = snykAPIBase;
    this.snykToken = snykToken;
    this.snykRequestId = randomUUID();
  }
  private snykAPIBase: string;
  private snykToken: string;
  private snykRequestId: string;
  async get(args: types.snykClientArgs) {
    if (args.poll) {
      return this.pollRequestToSnyk({
        method: types.requestMethods.GET,
        endpoint: args.endpoint,
        failFunction: args.failFunction,
        successFunction: args.successFunction,
        wait: args.wait ?? 10000,
        attempts: args.attempts ?? 20,
      });
    } else {
      return await this.makeRequestToSnyk({
        method: types.requestMethods.GET,
        endpoint: args.endpoint,
      });
    }
  }
  async post(args: types.snykClientArgs) {
    if (args.poll) {
      return this.pollRequestToSnyk({
        method: types.requestMethods.POST,
        endpoint: args.endpoint,
        body: args.body,
        failFunction: args.failFunction,
        successFunction: args.successFunction,
        wait: args.wait ?? 10000,
        attempts: args.attempts ?? 60,
      });
    } else {
      return await this.makeRequestToSnyk({
        method: types.requestMethods.POST,
        endpoint: args.endpoint,
        body: args.body,
      });
    }
  }
  async delete(endpoint: string) {
    return await this.makeRequestToSnyk({
      method: types.requestMethods.DELETE,
      endpoint: endpoint,
    });
  }
  private async makeRequestToSnyk(args: types.makeRequestToSnykArgs) {
    logger.debug(`Fetching ${this.snykAPIBase}/${args.endpoint}...`);
    let requestHeaders = {
      Authorization: `Token ${this.snykToken}`,
      "Content-Type": "application/json; charset=utf-8",
      "snyk-request-id": this.snykRequestId,
    } as types.snykRequestHeaders;
    const response = await fetch(
      `${this.snykAPIBase}/${args.endpoint}?version=2024-06-10`,
      {
        method: args.method,
        headers: requestHeaders,
        body: args.body,
      }
    );
    await sleep(100);
    const body =
      args.method === types.requestMethods.DELETE
        ? null
        : await response.json();
    logger.debug(`{
      method: ${args.method},
      endpoint: ${args.endpoint},
      status: ${response.status},
      ok: ${response.ok},
      data: ${JSON.stringify(body)},
      requestId: ${this.snykRequestId},
    }`);
    if (this.snykRequestId === undefined) {
      this.snykRequestId = response.headers.get("snyk-request-id");
    }
    return {
      status: response.status,
      ok: response.ok,
      data: body,
      headers: response.headers,
      requestId: this.snykRequestId,
    };
  }
  private async pollRequestToSnyk(args: types.pollRequestToSnykArgs) {
    let response;
    for (let i = 0; i < args.attempts; i++) {
      logger.info(
        `Polling attempt ${i + 1}/${
          args.attempts
        } for ${args.method.toUpperCase()} | ${args.endpoint} ...`
      );
      response = await this.makeRequestToSnyk({
        method: args.method,
        endpoint: args.endpoint,
        body: args.body,
      });
      if (args.failFunction(response)) {
        let errMsg = JSON.stringify(response.data);
        logger.error(
          `Request ${args.method.toUpperCase()} | ${
            args.endpoint
          } failed with status code ${response.status}`
        );
        dataDogLinker(response);
        logger.error(errMsg);
        process.exit(1);
      }
      if (args.successFunction(response)) {
        return response;
      }
      await sleep(args.wait);
    }
    logger.error("Reached maximum attempts without successful response");
    dataDogLinker(response);
  }
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function dataDogLinker(response) {
  logger.error(
    `DataDog may have more information: https://app.datadoghq.com/logs?query=%40requestId%3A${response.requestId}`
  );
}
