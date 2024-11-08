
[![Snyk logo](https://snyk.io/style/asset/logo/snyk-print.svg)](https://snyk.io)

# Helm Chart for Universal Broker

This is a Helm Chart to deploy the [Snyk Universal Broker](https://docs.snyk.io/enterprise-setup/snyk-broker/universal-broker).

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

## Parameters

### Snyk Broker parameters

| Name                                                | Description                                                                                                                                                                      | Value                    |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `brokerClientUrl`                                   | is the address of the broker. This needs to be the address of itself. In the case of Kubernetes, you need to ensure that you are pointing to the cluster ingress you have setup. | `""`                     |
| `tenant`                                            | Optionally specify a Snyk Region - defaults to "US".                                                                                                                             | `default`                |
| `preflightChecks.enabled`                           | broker client preflight checks                                                                                                                                                   | `true`                   |
| `deploymentId`                                      | is obtained by installing the Broker App at the Organization level                                                                                                               | `""`                     |
| `clientId`                                          | is obtained by installing the Broker App at the Organization level                                                                                                               | `""`                     |
| `clientSecret`                                      | is obtained by installing the Broker App at the Organization level                                                                                                               | `""`                     |
| `existingAuthSecret`                                | Name of existing secret with Snyk platform auth and scm credential reference data                                                                                                | `""`                     |
| `credentialReferences`                              | SCM token credential reference                                                                                                                                                   | `{}`                     |
| `acceptCode`                                        | Set to false to block Broker rules relating to Snyk Code analysis                                                                                                                | `true`                   |
| `acceptAppRisk`                                     | Set to false to block Broker rules relating to AppRisk                                                                                                                           | `true`                   |
| `acceptIaC`                                         | Defaults to "tf,yaml,yml,json,tpl". Optionally remove any extensions not required. Must be comma separated. Set to "" to block Broker rules relating to Snyk IaC analysis        | `""`                     |
| `acceptCustomPrTemplates`                           | Set to false to block Broker rules relating to Snyk Custom PR Templates                                                                                                          | `true`                   |
| `acceptLargeManifests`                              | Set to false to block Broker rules relating to fetching of large files from GitHub/GitHub Enterprise                                                                             | `true`                   |
| `containerPort`                                     | Port to open for HTTP in Broker                                                                                                                                                  | `8000`                   |
| `hostAliases`                                       | Broker pod host aliases                                                                                                                                                          | `[]`                     |
| `resources.requests.cpu`                            | Set CPU requests                                                                                                                                                                 | `2`                      |
| `resources.requests.memory`                         | Set memory requests                                                                                                                                                              | `512Mi`                  |
| `resources.limits.cpu`                              | Set CPU limits                                                                                                                                                                   | `3`                      |
| `resources.limits.memory`                           | Set memory limits                                                                                                                                                                | `1024Mi`                 |
| `commonLabels`                                      | Labels to add to all deployed objects (sub-charts are not considered)                                                                                                            | `{}`                     |
| `commonAnnotations`                                 | Annotations to add to all deployed objects (sub-charts are not considered)                                                                                                       | `{}`                     |
| `podLabels`                                         | Pod labels                                                                                                                                                                       | `{}`                     |
| `livenessProbe.enabled`                             | Enable livenessProbe                                                                                                                                                             | `true`                   |
| `livenessProbe.path`                                | Path for the livenessProbe                                                                                                                                                       | `/healthcheck`           |
| `livenessProbe.config.initialDelaySeconds`          | Initial delay seconds for livenessProbe                                                                                                                                          | `3`                      |
| `livenessProbe.config.periodSeconds`                | Period seconds for livenessProbe                                                                                                                                                 | `10`                     |
| `livenessProbe.config.timeoutSeconds`               | Timeout seconds for livenessProbe                                                                                                                                                | `1`                      |
| `livenessProbe.config.failureThreshold`             | Failure threshold for livenessProbe                                                                                                                                              | `3`                      |
| `readinessProbe.enabled`                            | Enable readinessProbe                                                                                                                                                            | `true`                   |
| `readinessProbe.path`                               | Path for the readinessProbe                                                                                                                                                      | `/healthcheck`           |
| `readinessProbe.config.initialDelaySeconds`         | Initial delay seconds for readinessProbe                                                                                                                                         | `3`                      |
| `readinessProbe.config.periodSeconds`               | Period seconds for readinessProbe                                                                                                                                                | `10`                     |
| `readinessProbe.config.timeoutSeconds`              | Timeout seconds for readinessProbe                                                                                                                                               | `1`                      |
| `readinessProbe.config.failureThreshold`            | Failure threshold for readinessProbe                                                                                                                                             | `3`                      |
| `highAvailabilityMode.enabled`                      | snyk broker HA mode                                                                                                                                                              | `false`                  |
| `replicaCount`                                      | number for snyk broker when running in HA mode (min 2, max 4)                                                                                                                    | `1`                      |
| `logLevel`                                          | defines Log Level for broker client pod. Can be set to "debug" for more information                                                                                              | `info`                   |
| `logEnableBody`                                     | adds additional logging by setting to true                                                                                                                                       | `false`                  |
| `enableBrokerLocalWebserverOverHttps`               | enables Broker client to run a HTTPS server instead of the default HTTP server                                                                                                   | `false`                  |
| `httpsCert`                                         | provides HTTPS cert                                                                                                                                                              | `""`                     |
| `httpsKey`                                          | provides HTTPS cert key                                                                                                                                                          | `""`                     |
| `caCert`                                            | Set caCert to read certificate content from the values.yaml file as a multiline string:                                                                                          | `""`                     |
| `caCertMount.path`                                  | the path to mount a certificate bundle to                                                                                                                                        | `"/home/node/cacert"`    |
| `caCertMount.name`                                  | the filename to write a certificate bundle to                                                                                                                                    | `"cacert"`               |
| `caCertSecret.name`                                 | set to read a CA cert from an external secret                                                                                                                                    | `""`                     |
| `caCertSecret.caCertKey`                            | set to read the ca cert from a different key                                                                                                                                     | `ca.pem`                 |
| `disableAllCertificateTrust`                        | Set to `true` to disable trust of **all** certificates, including any provided CAs                                                                                               | `false`                  |
| `httpProxy`                                         | Do not change unless advised by your Snyk Representative. You probably need to use HTTPS proxy setting and leave this blank. - HTTP Proxy URL                                    | `""`                     |
| `httpsProxy`                                        | HTTPS Proxy URL - This will apply to both Snyk Broker                                                                                                                            | `""`                     |
| `noProxy`                                           | provide URl here which doesn't need to go through a proxy(do not include protocol)                                                                                               | `""`                     |
| `image.registry`                                    | Broker image registry                                                                                                                                                            | `REGISTRY_NAME`          |
| `image.repository`                                  | Broker image repository                                                                                                                                                          | `REPOSITORY_NAME/broker` |
| `image.pullPolicy`                                  | Broker image pull policy                                                                                                                                                         | `IfNotPresent`           |
| `image.pullSecrets`                                 | Broker image pull secrets                                                                                                                                                        | `[]`                     |
| `serviceaccount.create`                             | Enable creation of serviceaccount for Broker pod                                                                                                                                 | `true`                   |
| `serviceaccount.existingName`                       | Optionally provide an existing service account name                                                                                                                              | `""`                     |
| `serviceaccount.annotations`                        | Additional custom annotations for the serviceaccount                                                                                                                             | `{}`                     |
| `serviceaccount.name`                               | The name of the serviceaccount to use.                                                                                                                                           | `""`                     |
| `podSecurityContext.enabled`                        | Enable security context for Broker Pods                                                                                                                                          | `true`                   |
| `podSecurityContext.fsGroupChangePolicy`            | Set filesystem group change policy                                                                                                                                               | `Always`                 |
| `podSecurityContext.sysctls`                        | Set kernel settings using the sysctl interface                                                                                                                                   | `[]`                     |
| `podSecurityContext.supplementalGroups`             | Set filesystem extra groups                                                                                                                                                      | `[]`                     |
| `podSecurityContext.fsGroup`                        | Group ID for the volumes of the pod                                                                                                                                              | `1000`                   |
| `containerSecurityContext.enabled`                  | Enabled Broker containers' Security Context                                                                                                                                      | `true`                   |
| `containerSecurityContext.seLinuxOptions`           | Set SELinux options in container                                                                                                                                                 | `{}`                     |
| `containerSecurityContext.runAsUser`                | Set Broker  containers' Security Context runAsUser                                                                                                                               | `1000`                   |
| `containerSecurityContext.runAsGroup`               | Set Broker containers' Security Context runAsGroup                                                                                                                               | `1000`                   |
| `containerSecurityContext.allowPrivilegeEscalation` | Set Broker containers' Security Context allowPrivilegeEscalation                                                                                                                 | `false`                  |
| `containerSecurityContext.capabilities.drop`        | Set containers' repo server Security Context capabilities to be dropped                                                                                                          | `["ALL"]`                |
| `containerSecurityContext.readOnlyRootFilesystem`   | Set containers' repo server Security Context readOnlyRootFilesystem                                                                                                              | `true`                   |
| `containerSecurityContext.runAsNonRoot`             | Set Broker containers' Security Context runAsNonRoot                                                                                                                             | `true`                   |
| `containerSecurityContext.privileged`               | Set container's Security Context privileged                                                                                                                                      | `false`                  |
| `containerSecurityContext.seccompProfile.type`      | Set container's Security Context seccomp profile                                                                                                                                 | `RuntimeDefault`         |
| `service.type`                                      | Broker svc type                                                                                                                                                                  | `ClusterIP`              |
| `service.ports.http`                                | Broker svc port                                                                                                                                                                  | `8000`                   |
| `service.tls`                                       | is running Broker with https                                                                                                                                                     | `[]`                     |
| `service.extraPorts`                                | Extra ports to expose                                                                                                                                                            | `[]`                     |
| `ingress.enabled`                                   | Set to true to create an Ingress                                                                                                                                                 | `true`                   |
| `ingress.ingressClassName`                          | Optionally define the Ingress Class for this ingress - otherwise leave blank                                                                                                     | `""`                     |
| `ingress.hostname`                                  | define the host associated with this ingress - add Broker_client_url here                                                                                                        | `broker.local`           |
| `ingress.extraHosts`                                | An array with additional hostname(s) to be covered with the ingress record                                                                                                       | `[]`                     |
| `ingress.tls.enabled`                               | Set to true to enable TLS on the in-built ingress                                                                                                                                | `false`                  |
| `ingress.tls.secret.key`                            | The TLS key for TLS encryption, in PEM format                                                                                                                                    | `""`                     |
| `ingress.tls.secret.cert`                           | The TLS certificate for TLS encryption, in PEM format                                                                                                                            | `""`                     |
| `ingress.annotations`                               | Additional annotations for the Ingress resource.                                                                                                                                 | `{}`                     |
| `ingress.path`                                      | Path for the default host                                                                                                                                                        | `/`                      |
| `ingress.pathType`                                  | Ingress path type                                                                                                                                                                | `Prefix`                 |
| `ingress.extraPaths`                                | Any additional arbitrary paths that may need to be added to the ingress under the main host.                                                                                     | `[]`                     |
| `ingress.existingSecret`                            | It is you own the certificate as secret.                                                                                                                                         | `""`                     |
| `extraVolumes`                                      | Optionally specify extra list of additional volumes for Broker container                                                                                                         | `[]`                     |
| `extraVolumeMounts`                                 | Optionally specify extra list of additional volumeMounts for Broker container                                                                                                    | `[]`                     |
| `extraEnvVars`                                      | Optionally specify extra list of additional environment variables for Broker container                                                                                           | `[]`                     |
