
[![Snyk logo](https://snyk.io/style/asset/logo/snyk-print.svg)](https://snyk.io)

# Helm Chart for Universal Broker

This is a Helm Chart to deploy the [Snyk Universal Broker](https://docs.snyk.io/enterprise-setup/snyk-broker/universal-broker).

## Parameters

### Snyk Broker Configuration

Refer to documentation via [docs.snyk.io](https://docs.snyk.io/enterprise-setup/snyk-broker/universal-broker/initial-configuration-of-the-universal-broker) to obtain `deploymentId`, `clientId`, `clientSecret` values.

Credential References should contain one or more key/value pairs where each key matches the `environment_variable_name` of a `deployment_credential`, and the value provides the secret. For example:
```bash
helm install ... --set credentialReferences.MY_GITHUB_TOKEN=<gh-pat>
```

| Name                              | Description                                                                                                    | Value |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------- | ----- |
| `brokerClientUrl`                 | The resolvable address of the Broker. This is likely the address of the Ingress (if enabled)                   | `""`  |
| `region`                          | Optionally specify a Snyk Region - e.g. "eu" for "SNYK-EU-01". Defaults to "SNYK-US-01", app.snyk.io           | `""`  |
| `deploymentId`                    | obtained by installing the Broker App                                                                          | `""`  |
| `clientId`                        | obtained by installing the Broker App                                                                          | `""`  |
| `clientSecret`                    | obtained by installing the Broker App                                                                          | `""`  |
| `platformAuthSecret.name`         | Optionally provide an external secret containing three keys: `DEPLOYMENT_ID`, `CLIENT_ID` and `CLIENT_SECRET`. | `""`  |
| `credentialReferences`            | Credential References to pass to Broker.                                                                       | `{}`  |
| `credentialReferencesSecret.name` | Optionally provide a pre-existing secret with SCM credential reference data                                    | `""`  |

### Networking Parameters

| Name                               | Description                                                                                             | Value       |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------- |
| `containerPort`                    | The port the Broker container will expose.                                                              | `8000`      |
| `hostAliases`                      | Add host aliases to the Broker pod if required                                                          | `[]`        |
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

| Name                         | Description                                                                                 | Value                      |
| ---------------------------- | ------------------------------------------------------------------------------------------- | -------------------------- |
| `ingress.enabled`            | Set to true to create an Ingress                                                            | `false`                    |
| `ingress.className`          | Optionally define an Ingress Class                                                          | `""`                       |
| `ingress.annotations`        | Additional annotations for the Ingress resource.                                            | `{}`                       |
| `ingress.path`               | sets the path associated with the ingress                                                   | `"/"`                      |
| `ingress.pathType`           | sets the path type associated with the ingress                                              | `"ImplementationSpecific"` |
| `ingress.hostname`           | define the host associated with this ingress - add Broker_client_url here                   | `"broker.local"`           |
| `ingress.extraHosts`         | An array with additional hostname(s) to be covered with the ingress record                  | `[]`                       |
| `ingress.extraPaths`         | Any additional arbitrary paths that may need to be added to the ingress under the main host | `[]`                       |
| `ingress.extraTls`           | Any additional tls entries to add to the ingress                                            | `[]`                       |
| `ingress.extraRules`         | Any additional rules to add to the ingress                                                  | `[]`                       |
| `ingress.secrets`            | A list of TLS secrets to create, each with `name`, `key` and `certificate`                  | `[]`                       |
| `ingress.tls.enabled`        | Set to true to enable TLS on the in-built ingress                                           | `false`                    |
| `ingress.tls.existingSecret` | Specify an existing TLS secret to use with this ingress                                     | `""`                       |

### Metadata

| Name                | Description                                       | Value |
| ------------------- | ------------------------------------------------- | ----- |
| `commonLabels`      | Labels to add to all deployed objects             | `{}`  |
| `commonAnnotations` | Annotations to add to all deployed objects        | `{}`  |
| `podLabels`         | Labels to add to the Broker Pod                   | `{}`  |
| `affinity`          | Any affinities/anti-affinities to apply to Broker | `{}`  |
| `nodeSelector`      | Any node labels to match when scheduling Broker   | `{}`  |
| `tolerations`       | Any taints to tolerate when scheduling Broker     | `{}`  |

### Runtime

| Name                                | Description                                                                                                               | Value    |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------- |
| `preflightChecks.enabled`           | Preflight checks are present in the Broker to assert connectivity and configuration correctness. Set to false to disable. | `true`   |
| `runtimeClassName`                  | Optionally specify a runtimeClassName for Broker to target                                                                | `""`     |
| `priorityClassName`                 | Optionally specify a priorityClassName for Broker to target                                                               | `""`     |
| `resources.requests.cpu`            | Set CPU requests                                                                                                          | `1`      |
| `resources.requests.memory`         | Set memory requests                                                                                                       | `512Mi`  |
| `resources.limits.cpu`              | Set CPU limits                                                                                                            | `2`      |
| `resources.limits.memory`           | Set memory limits                                                                                                         | `1024Mi` |
| `highAvailabilityMode.enabled`      | snyk [default: false] Enable High Availability Mode for Broker                                                            | `false`  |
| `highAvailabilityMode.replicaCount` | Number of Broker pods when running in HA mode (min 2, max 4)                                                              | `2`      |

### Probes

| Name                                        | Description                                               | Value            |
| ------------------------------------------- | --------------------------------------------------------- | ---------------- |
| `livenessProbe.enabled`                     | Enable livenessProbe                                      | `true`           |
| `livenessProbe.path`                        | Path for the livenessProbe                                | `"/healthcheck"` |
| `livenessProbe.config.initialDelaySeconds`  | Initial delay in seconds                                  | `3`              |
| `livenessProbe.config.periodSeconds`        | Seconds between probes                                    | `10`             |
| `livenessProbe.config.timeoutSeconds`       | Elapsed second(s) for timeout                             | `1`              |
| `livenessProbe.config.failureThreshold`     | Number of consecutive probe failures to mark as unhealty  | `3`              |
| `readinessProbe.enabled`                    | Enable readinessProbe                                     | `true`           |
| `readinessProbe.path`                       | Path for the readinessProbe                               | `/healthcheck`   |
| `readinessProbe.config.initialDelaySeconds` | Initial delay in seconds                                  | `3`              |
| `readinessProbe.config.periodSeconds`       | Seconds between probes                                    | `10`             |
| `readinessProbe.config.timeoutSeconds`      | Elapsed second(s) for timeout                             | `1`              |
| `readinessProbe.config.failureThreshold`    | Number of consecutive probe failures to mark as not ready | `3`              |

### Logging

| Name            | Description                                                                                               | Value   |
| --------------- | --------------------------------------------------------------------------------------------------------- | ------- |
| `logLevel`      | defines Log Level for broker client pod. Can be set to "debug" for more information.                      | `info`  |
| `logEnableBody` | adds additional logging by setting to true. Will vastly increase log output - enable for diagnostics only | `false` |

### Serving over HTTPS and Certificate Trust

| Name                         | Description                                                                                     | Value                 |
| ---------------------------- | ----------------------------------------------------------------------------------------------- | --------------------- |
| `localWebServer.https`       | enables Broker client to run a HTTPS server instead of the default HTTP server                  | `false`               |
| `localWebServer.certificate` | Provide HTTPS cert                                                                              | `""`                  |
| `localWebServer.key`         | Provides HTTPS cert key                                                                         | `""`                  |
| `localWebServerSecret.name`  | the name of the secret to create or (if cert and key are empty) the existing TLS secret to use. | `""`                  |
| `caCert`                     | Set caCert to read certificate content from the values.yaml file as a multiline string:         | `""`                  |
| `caCertMount.path`           | the path to mount a certificate bundle to                                                       | `"/home/node/cacert"` |
| `caCertMount.name`           | the filename to write a certificate bundle to                                                   | `"cacert"`            |
| `caCertSecret.name`          | set to read a CA cert from an external secret                                                   | `""`                  |
| `caCertSecret.caCertKey`     | set to read the ca cert from a different key                                                    | `ca.pem`              |
| `disableAllCertificateTrust` | Set to `true` to disable trust of **all** certificates, including any provided CAs              | `false`               |

### Proxy Configuration

| Name                        | Description                                                                                                                                     | Value |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| `httpProxy`                 | Set to proxy any http-only traffic. You probably need to use HTTPS proxy setting and leave this blank.                                          | `""`  |
| `httpsProxy`                | HTTPS Proxy URL. Optionally provide user/password auth in the url.                                                                              | `""`  |
| `noProxy`                   | A comma-separated list of hostnames that must not transit a proxy. Do not include protocol or port numbers.                                     | `""`  |
| `proxySecret.name`          | The name of a pre-existing secret containing up to three entries. If set, supersedes .Values.httpProxy, .Values.httpsProxy and .Values.noProxy. | `""`  |
| `proxySecret.httpProxyKey`  | Specify the key within the pre-existing secret containing the value for HTTP_PROXY. If left empty, no value is set.                             | `""`  |
| `proxySecret.httpsProxyKey` | Specify the key within the pre-existing secret containing the value for HTTPS_PROXY. If left empty, no value is set.                            | `""`  |
| `proxySecret.noProxyKey`    | Specify the key within the pre-existing secret containing the value for NO_PROXY. If left empty, no value is set.                               | `""`  |

### Container Registry

| Name                | Description                                       | Value          |
| ------------------- | ------------------------------------------------- | -------------- |
| `image.registry`    | Broker image registry                             | `docker.io`    |
| `image.repository`  | Broker image repository                           | `snyk/broker`  |
| `image.tag`         | Broker image tag (immutable tags are recommended) | `universal`    |
| `image.pullPolicy`  | Broker image pull policy                          | `IfNotPresent` |
| `image.pullSecrets` | Broker image pull secrets                         | `[]`           |

### Service Account

| Name                          | Description                                                                                  | Value  |
| ----------------------------- | -------------------------------------------------------------------------------------------- | ------ |
| `serviceAccount.create`       | Enable creation of a serviceAccount                                                          | `true` |
| `serviceAccount.existingName` | Optionally provide an existing serviceAccount name                                           | `""`   |
| `serviceAccount.annotations`  | Additional custom annotations for the serviceAccount                                         | `{}`   |
| `serviceAccount.name`         | The name of the serviceAccount to create. If not set and create is true, a name is generated | `""`   |

### Security Contexts

| Name                                                | Description                                                             | Value            |
| --------------------------------------------------- | ----------------------------------------------------------------------- | ---------------- |
| `podSecurityContext.enabled`                        | Enable Pod Security Context for Broker                                  | `true`           |
| `podSecurityContext.fsGroupChangePolicy`            | Set filesystem group change policy                                      | `Always`         |
| `podSecurityContext.sysctls`                        | Set kernel settings using the sysctl interface                          | `[]`             |
| `podSecurityContext.fsGroup`                        | Group ID for the volumes of the pod                                     | `1000`           |
| `podSecurityContext.supplementalGroups`             | Set filesystem groups                                                   | `[]`             |
| `containerSecurityContext.enabled`                  | Enabled Broker containers' Security Context                             | `true`           |
| `containerSecurityContext.seLinuxOptions`           | Set SELinux options in container                                        | `{}`             |
| `containerSecurityContext.runAsUser`                | Set Broker  containers' Security Context runAsUser                      | `1000`           |
| `containerSecurityContext.runAsGroup`               | Set Broker containers' Security Context runAsGroup                      | `1000`           |
| `containerSecurityContext.allowPrivilegeEscalation` | Set Broker containers' Security Context allowPrivilegeEscalation        | `false`          |
| `containerSecurityContext.capabilities.drop`        | Set containers' repo server Security Context capabilities to be dropped | `["ALL"]`        |
| `containerSecurityContext.readOnlyRootFilesystem`   | Set containers' repo server Security Context readOnlyRootFilesystem     | `true`           |
| `containerSecurityContext.runAsNonRoot`             | Set Broker containers' Security Context runAsNonRoot                    | `true`           |
| `containerSecurityContext.privileged`               | Set container's Security Context privileged                             | `false`          |
| `containerSecurityContext.seccompProfile.type`      | Set container's Security Context seccompProfile                         | `RuntimeDefault` |

### Additional Objects

| Name                 | Description                                                                                               | Value |
| -------------------- | --------------------------------------------------------------------------------------------------------- | ----- |
| `sidecars`           | Any sidecars to attach to Broker                                                                          | `[]`  |
| `initContainers`     | Any initContainers to run before Broker                                                                   | `[]`  |
| `extraVolumes`       | Optionally specify extra list of additional volumes for Broker container                                  | `[]`  |
| `extraVolumeMounts`  | Optionally specify extra list of additional volumeMounts for Broker container                             | `[]`  |
| `extraEnvVars`       | Optionally specify extra list of additional environment variables for Broker container                    | `[]`  |
| `extraEnvVarsCM`     | Optionally specify one or more external configmaps containing additional environment variables for Broker | `[]`  |
| `extraEnvVarsSecret` | Optionally specify one or more external secrets containing additional environment variables for Broker    | `[]`  |
