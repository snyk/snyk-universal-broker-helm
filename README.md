
[![Snyk logo](https://snyk.io/style/asset/logo/snyk-print.svg)](https://snyk.io)

# Helm Chart for Universal Broker

This is a Helm Chart to deploy the [Snyk Universal Broker](https://docs.snyk.io/enterprise-setup/snyk-broker/universal-broker).

## Requirements

### Networking

#### Outbound

Universal Broker requires outbound communication via TLS to the following domains (or your regional equivalent):

- `https://api.snyk.io`
- `https://app.snyk.io`
- `https://broker.snyk.io`

If a proxy, firewall, or other network appliance sits between Broker and the public internet, ensure:
- the above domains are whitelisted, _and_
- the proxy, firewall or other network appliance supports the websockets protocol

## Basic Configuration

### Selecting your Snyk Region

If required, specify your [Snyk Region](https://docs.snyk.io/working-with-snyk/regional-hosting-and-data-residency#available-snyk-regions) by entering the url fragment between `app` and `snyk.io` into `region`. For example, to set the Universal Broker to connect to `SNYK-EU-01`:

```yaml
region: "eu"
```

### Credential References

Any Credential References (refer to the example provided on [docs.snyk.io](https://docs.snyk.io/enterprise-setup/snyk-broker/universal-broker/set-up-a-github-connection-using-the-api#id-3-create-your-credentials-references)) must be provided to the Universal Broker. This can be achieved directly through Helm, or via an external Kubernetes Secret.

For the following example, assume three credential references are created of the following `deployment_credential` types:
- `github`
- `gitlab`
- `azure-repos`

An example data object is shown for the `github` type.
```json
{
  ...
  "data":{
    "id": "uuidv4",
    "type": "deployment_credential",
    "attributes": {
      "comment": "",
      "deployment_id": "uuidv4",
      "environment_variable_name": "MY_GITHUB_TOKEN",
      "type": "github"
    }
  }
}
```
The number of credential references will depend on the `type` of the `deployment_credential`; `github` holds just one (the GitHub PAT), whilst `azure-repos` holds three (the Azure Repos Org, Username and Password)

#### Via Helm

Provide the environment variable used when creating the credential reference, and the actual value of your credential.

For example, providing the Universal Broker with a GitHub, GitLab and Azure Repos credential:

```yaml
credentialReferences:
  MY_GITHUB_TOKEN: <your-github-token>
  MY_GITLAB_TOKEN: <your-gitlab-token>
  AZURE_REPOS_PRODSEC_ORG: prodsec
  AZURE_REPOS_PRODSEC_USERNAME: <your-azure-repos-username>
  AZURE_REPOS_PRODSEC_PASSWORD: <your-azure-repos-password>
```

The Universal Broker Helm Chart creates this secret for you.

#### Via External Secret

First create or otherwise ensure the secret exists:

```yaml
kind: Secret
apiVersion: v1
metadata:
  name: my-universal-broker-secrets
data:
  MY_GITHUB_TOKEN: <your-github-token>
  ...
```

Then set values within `.Values.credentialReferencesSecret` that match your external Secret:

```yaml
credentialReferencesSecret:
  name: my-universal-broker-secrets
```

### Service

By default, Universal Broker provides a `ClusterIP` Service. This can be adjusted to a `LoadBalancer`, `NodePort` as best fits the deployment environment.

### Ingress

Universal Broker provides an Ingress template, compatible with any Kubernetes Ingress controller.

It may be [extended with additional hosts, paths, annotations as required](#broker-ingress).

## Advanced Configuration

### Certificate Trust

Certificate Authority material may be provided directly to Universal Broker in the Helm Chart, or referenced to an external secret.

#### Via Helm

If providing directly to Helm, set `.Values.caCert` to the full trust chain necessary (this may be multiple certificates) for your Certificate Authority in PEM format as a string.

```yaml
caCert: |-
  -----BEGIN CERTIFICATE-----
  ...
  -----END CERTIFICATE-----
```

The Universal Broker Helm Chart creates this secret for you.

#### Via External Secret

First create or otherwise ensure the secret exists:

```yaml
kind: Secret
apiVersion: v1
metadata:
  name: ca-certificate
data:
  ca.pem: -----BEGIN CERTIFICATE-----.....
```

Then set values within `.Values.caCertSecret` that match your external Secret:
```yaml
caCertSecret:
  name: ca-certificate
  caCertKey: ca.pem
```

#### Disable All Trust

Set `.Values.disableAllCertificateTrust` to `true`. Broker will no longer validate any certificates, **including those issued by public Certificate Authorities**.

### Use a Custom Image Registry

The Universal Broker Helm Chart will pull directly from DockerHub by default. Using the pull command for your private container registry as reference, set `image.registry` to the domain of your registry, and `image.repository` to the internal repository the Broker image will be available from.

For example, this might be:

```yaml
image:
  registry: containers.company
  repository: docker/broker
```

#### Image Pull Secrets

Set `.Values.image.pullSecrets` if the custom image registry requires authentication. The Universal Broker Helm Chart will reference a pre-existing secret; it will not create one. Multiple secrets may be specified.

```yaml
image:
  registry: containers.company
  repository: docker/broker
  imagePullSecrets:
    - name: containers-company-secret
```

## Parameters

### Snyk Broker parameters

Refer to documentation via [docs.snyk.io](https://docs.snyk.io/enterprise-setup/snyk-broker/universal-broker/initial-configuration-of-the-universal-broker) to obtain `deploymentId`, `clientId`, `clientSecret` values.

Credential References should contain one or more key/value pairs where each key matches the `environment_variable_name` of a `deployment_credential`, and the value provides the secret. For example:
```bash
helm install ... --set credentialReferences.MY_GITHUB_TOKEN=<gh-pat>
```

| Name                              | Description                                                                                                                                                                      | Value  |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `brokerClientUrl`                 | is the address of the broker. This needs to be the address of itself. In the case of Kubernetes, you need to ensure that you are pointing to the cluster ingress you have setup. | `""`   |
| `region`                          | Optionally specify a Snyk Region - e.g. "eu" for "SNYK-EU-01". Defaults to "SNYK-US-01", app.snyk.io                                                                             | `""`   |
| `preflightChecks.enabled`         | broker client preflight checks                                                                                                                                                   | `true` |
| `deploymentId`                    | Obtained by installing the Broker App                                                                                                                                            | `""`   |
| `clientId`                        | Obtained by installing the Broker App                                                                                                                                            | `""`   |
| `clientSecret`                    | Obtained by installing the Broker App                                                                                                                                            | `""`   |
| `platformAuthSecret.name`         | Optionally provide an external secret containing three keys: `DEPLOYMENT_ID`, `CLIENT_ID` and `CLIENT_SECRET`                                                                    | `""`   |
| `credentialReferences`            | Credential References to pass to Broker                                                                                                                                          | `{}`   |
| `credentialReferencesSecret.name` | Optionally provide a pre-existing secret with SCM credential reference data                                                                                                      | `""`   |
| `acceptCode`                      | Set to false to block Broker rules relating to Snyk Code analysis                                                                                                                | `true` |
| `acceptAppRisk`                   | Set to false to block Broker rules relating to AppRisk                                                                                                                           | `true` |
| `acceptIaC`                       | Defaults to "tf,yaml,yml,json,tpl". Optionally remove any extensions not required. Must be comma separated. Set to "" to block Broker rules relating to Snyk IaC analysis        | `""`   |
| `acceptCustomPrTemplates`         | Set to false to block Broker rules relating to Snyk Custom PR Templates                                                                                                          | `true` |
| `acceptLargeManifests`            | Set to false to block Broker rules relating to fetching of large files from GitHub/GitHub Enterprise                                                                             | `true` |

### Networking Parameters

| Name                               | Description                                                                                             | Value       |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------- |
| `containerPort`                    | Port to open for HTTP in Broker                                                                         | `8000`      |
| `hostAliases`                      | Broker pod host aliases                                                                                 | `[]`        |
| `service.type`                     | Set the included Service type                                                                           | `ClusterIP` |
| `service.port`                     | Set the port the Service will expose                                                                    | `8000`      |
| `service.nodePort`                 | Optionally specify a nodePort (only takes effect if service.type=NodePort)                              | `nil`       |
| `service.clusterIP`                | Optionally specify an IP address (only takes effect if service.type=ClusterIP)                          | `nil`       |
| `service.loadBalancerIP`           | Optionally specify an IP address (only takes effect if service.type=LoadBalancer)                       | `nil`       |
| `service.loadBalancerSourceRanges` | Specify an array of CIDR blocks to permit traffic from (only takes effect if service.type=LoadBalancer) | `[]`        |
| `service.externalTrafficPolicy`    | Set the externalTrafficPolicy of the service (only takes effect if service.type=LoadBalancer)           | `Cluster`   |
| `service.extraPorts`               | Add extra ports to the Service                                                                          | `[]`        |
| `service.tls`                      | Enable TLS at the Service level                                                                         | `[]`        |

### Broker Ingress

| Name                                        | Description                                                                                                                                   | Value                      |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `ingress.enabled`                           | Set to true to create an Ingress                                                                                                              | `false`                    |
| `ingress.className`                         | Optionally define an Ingress Class                                                                                                            | `""`                       |
| `ingress.annotations`                       | Additional annotations for the Ingress resource                                                                                               | `{}`                       |
| `ingress.path`                              | sets the path associated with the ingress                                                                                                     | `"/"`                      |
| `ingress.pathType`                          | sets the path type associated with the ingress                                                                                                | `"ImplementationSpecific"` |
| `ingress.hostname`                          | define the host associated with this ingress - add Broker_client_url here                                                                     | `"broker.local"`           |
| `ingress.extraHosts`                        | An array with additional hostname(s) to be covered with the ingress record                                                                    | `[]`                       |
| `ingress.extraPaths`                        | Any additional arbitrary paths that may need to be added to the ingress under the main host                                                   | `[]`                       |
| `ingress.extraTls`                          | Any additional tls entries to add to the ingress                                                                                              | `[]`                       |
| `ingress.extraRules`                        | Any additional rules to add to the ingress                                                                                                    | `[]`                       |
| `ingress.secrets`                           | A list of TLS secrets to create, each with `name`, `key` and `certificate`                                                                    | `[]`                       |
| `ingress.tls.enabled`                       | Set to true to enable TLS on the in-built ingress                                                                                             | `false`                    |
| `ingress.tls.existingSecret`                | Specify an existing TLS secret to use with this ingress                                                                                       | `""`                       |
| `resources.requests.cpu`                    | Set CPU requests                                                                                                                              | `2`                        |
| `resources.requests.memory`                 | Set memory requests                                                                                                                           | `512Mi`                    |
| `resources.limits.cpu`                      | Set CPU limits                                                                                                                                | `3`                        |
| `resources.limits.memory`                   | Set memory limits                                                                                                                             | `1024Mi`                   |
| `commonLabels`                              | Labels to add to all deployed objects (sub-charts are not considered)                                                                         | `{}`                       |
| `commonAnnotations`                         | Annotations to add to all deployed objects (sub-charts are not considered)                                                                    | `{}`                       |
| `podLabels`                                 | Pod labels                                                                                                                                    | `{}`                       |
| `livenessProbe.enabled`                     | Enable livenessProbe                                                                                                                          | `true`                     |
| `livenessProbe.path`                        | Path for the livenessProbe                                                                                                                    | `/healthcheck`             |
| `livenessProbe.config.initialDelaySeconds`  | Initial delay seconds for livenessProbe                                                                                                       | `3`                        |
| `livenessProbe.config.periodSeconds`        | Period seconds for livenessProbe                                                                                                              | `10`                       |
| `livenessProbe.config.timeoutSeconds`       | Timeout seconds for livenessProbe                                                                                                             | `1`                        |
| `livenessProbe.config.failureThreshold`     | Failure threshold for livenessProbe                                                                                                           | `3`                        |
| `readinessProbe.enabled`                    | Enable readinessProbe                                                                                                                         | `true`                     |
| `readinessProbe.path`                       | Path for the readinessProbe                                                                                                                   | `/healthcheck`             |
| `readinessProbe.config.initialDelaySeconds` | Initial delay seconds for readinessProbe                                                                                                      | `3`                        |
| `readinessProbe.config.periodSeconds`       | Period seconds for readinessProbe                                                                                                             | `10`                       |
| `readinessProbe.config.timeoutSeconds`      | Timeout seconds for readinessProbe                                                                                                            | `1`                        |
| `readinessProbe.config.failureThreshold`    | Failure threshold for readinessProbe                                                                                                          | `3`                        |
| `highAvailabilityMode.enabled`              | snyk broker HA mode                                                                                                                           | `false`                    |
| `replicaCount`                              | number for snyk broker when running in HA mode (min 2, max 4)                                                                                 | `1`                        |
| `logLevel`                                  | defines Log Level for broker client pod. Can be set to "debug" for more information                                                           | `info`                     |
| `logEnableBody`                             | adds additional logging by setting to true                                                                                                    | `false`                    |
| `enableBrokerLocalWebserverOverHttps`       | enables Broker client to run a HTTPS server instead of the default HTTP server                                                                | `false`                    |
| `httpsCert`                                 | provides HTTPS cert                                                                                                                           | `""`                       |
| `httpsKey`                                  | provides HTTPS cert key                                                                                                                       | `""`                       |
| `caCert`                                    | Set caCert to read certificate content from the values.yaml file as a multiline string:                                                       | `""`                       |
| `caCertMount.path`                          | the path to mount a certificate bundle to                                                                                                     | `"/home/node/cacert"`      |
| `caCertMount.name`                          | the filename to write a certificate bundle to                                                                                                 | `"cacert"`                 |
| `caCertSecret.name`                         | set to read a CA cert from an external secret                                                                                                 | `""`                       |
| `caCertSecret.caCertKey`                    | set to read the ca cert from a different key                                                                                                  | `ca.pem`                   |
| `disableAllCertificateTrust`                | Set to `true` to disable trust of **all** certificates, including any provided CAs                                                            | `false`                    |
| `httpProxy`                                 | Do not change unless advised by your Snyk Representative. You probably need to use HTTPS proxy setting and leave this blank. - HTTP Proxy URL | `""`                       |
| `httpsProxy`                                | HTTPS Proxy URL - This will apply to both Snyk Broker                                                                                         | `""`                       |
| `noProxy`                                   | provide URl here which doesn't need to go through a proxy(do not include protocol)                                                            | `""`                       |

### Image Registry

| Name                | Description                                        | Value          |
| ------------------- | -------------------------------------------------- | -------------- |
| `image.registry`    | Broker image registry                              | `docker.io`    |
| `image.repository`  | Broker image repository                            | `snyk/broker`  |
| `image.tag`         | Broker image tag                                   | `universal`    |
| `image.pullPolicy`  | Broker image pull policy                           | `IfNotPresent` |
| `image.pullSecrets` | Optionally provide any existing image pull secrets | `[]`           |

### Service Account

| Name                                                | Description                                                                                  | Value            |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------- |
| `serviceAccount.create`                             | Enable creation of a serviceAccount                                                          | `true`           |
| `serviceAccount.existingName`                       | Optionally provide an existing serviceAccount name                                           | `""`             |
| `serviceAccount.annotations`                        | Additional custom annotations for the serviceAccount                                         | `{}`             |
| `serviceAccount.name`                               | The name of the serviceAccount to create. If not set and create is true, a name is generated | `""`             |
| `podSecurityContext.enabled`                        | Enable security context for Broker Pods                                                      | `true`           |
| `podSecurityContext.fsGroupChangePolicy`            | Set filesystem group change policy                                                           | `Always`         |
| `podSecurityContext.sysctls`                        | Set kernel settings using the sysctl interface                                               | `[]`             |
| `podSecurityContext.supplementalGroups`             | Set filesystem extra groups                                                                  | `[]`             |
| `podSecurityContext.fsGroup`                        | Group ID for the volumes of the pod                                                          | `1000`           |
| `containerSecurityContext.enabled`                  | Enabled Broker containers' Security Context                                                  | `true`           |
| `containerSecurityContext.seLinuxOptions`           | Set SELinux options in container                                                             | `{}`             |
| `containerSecurityContext.runAsUser`                | Set Broker  containers' Security Context runAsUser                                           | `1000`           |
| `containerSecurityContext.runAsGroup`               | Set Broker containers' Security Context runAsGroup                                           | `1000`           |
| `containerSecurityContext.allowPrivilegeEscalation` | Set Broker containers' Security Context allowPrivilegeEscalation                             | `false`          |
| `containerSecurityContext.capabilities.drop`        | Set containers' repo server Security Context capabilities to be dropped                      | `["ALL"]`        |
| `containerSecurityContext.readOnlyRootFilesystem`   | Set containers' repo server Security Context readOnlyRootFilesystem                          | `true`           |
| `containerSecurityContext.runAsNonRoot`             | Set Broker containers' Security Context runAsNonRoot                                         | `true`           |
| `containerSecurityContext.privileged`               | Set container's Security Context privileged                                                  | `false`          |
| `containerSecurityContext.seccompProfile.type`      | Set container's Security Context seccomp profile                                             | `RuntimeDefault` |
| `extraVolumes`                                      | Optionally specify extra list of additional volumes for Broker container                     | `[]`             |
| `extraVolumeMounts`                                 | Optionally specify extra list of additional volumeMounts for Broker container                | `[]`             |
| `extraEnvVars`                                      | Optionally specify extra list of additional environment variables for Broker container       | `[]`             |

