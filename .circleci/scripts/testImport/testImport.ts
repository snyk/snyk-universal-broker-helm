// Expect a file to read import data from and the snyk api base
import * as fs from "node:fs";
import makeLog from "./logger";
import snykApiClient from "./utils";
import * as types from "./types";
// Initialise logger
const logger = new makeLog();
let testImportMaxAttempts = 3;
// Obtain command line arguments
const args = process.argv.slice(2);

const [fileName, snykAPIBase] = args;
const snykToken = process.env.SNYK_TOKEN;

let missingConfig = false;
if (snykToken == undefined) {
  logger.error("Environment variable SNYK_TOKEN must be defined");
  missingConfig = true;
}

// Ensure a filename is passed
if (fileName == undefined) {
  logger.error("fileName must be provided as first argument");
  missingConfig = true;
}

if (snykAPIBase == undefined) {
  logger.error("snykApiBase must be provided as second argument");
  missingConfig = true;
}

if (missingConfig) {
  process.exit(1);
}

const client = new snykApiClient(snykAPIBase, snykToken);
const snykAppBase = snykAPIBase.replace("api.", "app.");

// Get all targets on an org
async function getTargets(orgId) {
  return await client.get({ endpoint: `rest/orgs/${orgId}/targets` });
}

// Remove all targets on an org matching the inferred integration type
async function removeTargets(orgId, integrationId) {
  // Get a list of targets that exist on the organisation
  const targets = await getTargets(orgId);
  logger.debug(`Found ${(targets.data["data"]).length} targets`)
  //
  for (const target of targets.data["data"]) {
    // Each target has attributes.origin == integrationType
    if (target["relationships"]["integration"]["data"]["id"] == integrationId) {
      // Remove this target
      logger.info(`Removing target ${JSON.stringify(target)}`);
      await client.delete(`rest/orgs/${orgId}/targets/${target["id"]}`);
    }
  };
}

async function pollRequestImport(
  importDataTarget: object,
  orgId: string,
  integrationId: string
) {
  let importResponse = await client.post({
    endpoint: `v1/org/${orgId}/integrations/${integrationId}/import`,
    body: JSON.stringify({
      target: importDataTarget["target"],
    }),
    poll: true,
    failFunction: (response) => {
      return response.status != "404" && !response.ok;
    },
    successFunction: (response) => {
      return response.status == "201";
    },
    wait: 10000,
    attempts: 5,
  });
  return importResponse;
}

async function pollJobStatus(
  orgId: string,
  integrationId: string,
  jobId: string
) {
  let jobStatusResponse = await client.get({
    endpoint: `v1/org/${orgId}/integrations/${integrationId}/import/${jobId}`,
    poll: true,
    failFunction: (response) => {
      return ["failed", "aborted"].includes(response.data["status"]);
    },
    successFunction: (response) => {
      const logs = response.data.logs
      if (logs.length > 0) {
        const success = response.data["status"].includes("complete");
        const noFailedProjects = logs[0].projects.some((project) => project.success === false);
        return success && !noFailedProjects;
      }
    },
  });
  return jobStatusResponse;
}

async function runImport(importDataTarget, orgId, orgName, integrationId) {
  // Start importing
  logger.info(
    `Importing target: ${JSON.stringify(importDataTarget["target"])}`
  );

  let importResponse = await pollRequestImport(
    importDataTarget,
    orgId,
    integrationId
  );
  // Obtain resulting Job ID from `location` header
  const jobUrl = importResponse.headers.get("location");
  const jobId = jobUrl.split("/").pop();
  logger.info(`Polling import job ${jobId} for job status`);
  // Poll until complete or failed
  let jobResponse = await pollJobStatus(orgId, integrationId, jobId);
  // If complete, get all projects that resulted from the import
  const jobProjects = jobResponse.data["logs"][0]["projects"];
  jobProjects.forEach(async (project) => {
    // Each project will have `targetFile`, _unless_ it's a Code project
    if (!("targetFile" in project)) {
      // Get the project
      const projectId = project["projectId"];
      const projectData = await client.get({
        endpoint: `rest/orgs/${orgId}/projects/${projectId}`,
      });
      try {
        if (projectData.data["data"]["attributes"]["type"] === "sast") {
          logger.info("SAST import successful");
          logger.info(`${snykAppBase}/org/${orgName}/project/${projectId}`);
          process.exit(0);
        }
      } catch {
        // This fails sometimes
        logger.warn("Could not determine project type, may retry")
        logger.debug(JSON.stringify(projectData));
      }
    }
  });
}

// Check the filename exists
const importData = fs.readFileSync(fileName, "utf8");
const importDataTargets: Array<types.importDataTargetSpec> =
  JSON.parse(importData)["targets"];

importDataTargets.forEach(async (importDataTarget) => {
  let testImportAttempts = 0;
  const orgId = importDataTarget.orgId;
  const integrationId = importDataTarget.integrationId;

  // Get org
  const orgs = await client.get({ endpoint: "v1/orgs" });
  const targetOrg = orgs.data["orgs"].find((org) => org.id == orgId);
  const orgName = targetOrg.name;

  // Get all integrations on target org
  const integrations = await client.get({
    endpoint: `v1/org/${orgId}/integrations`,
  });

  // Ensure the integration we want is on the targeted org
  const integrationType = Object.keys(integrations.data).find(
    (key) => integrations.data[key] === integrationId
  );
  logger.info(`Integration type: ${integrationType}`);

  // Remove old targets from this integration
  await removeTargets(orgId, integrationId);

  await runImport(importDataTarget, orgId, orgName, integrationId);
  // If we get here, we'll need to retry
  if (testImportMaxAttempts == testImportAttempts) {
    logger.error(
      `Maximum attempts reached to import target ${JSON.stringify(
        importDataTarget
      )}`
    );
    process.exit(1);
  } else {
    testImportAttempts++;
    await runImport(importDataTarget, orgId, orgName, integrationId);
  }
});
