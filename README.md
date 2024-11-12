
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

### High Availability Mode

Universal Broker will run with [High Availability Mode](https://docs.snyk.io/enterprise-configuration/snyk-broker/high-availability-mode) enabled by default. Optionally increase the number of replicas from 2 up to 4 to suit fault tolerance.

High Availability Mode may be disabled by setting `highAvailabilityMode.enabled: false`.

## Advanced Configuration

### Configure an Outbound Proxy

To use Universal Broker behind a proxy, set:

- `.Values.httpsProxy` to the Proxy URL - this may contain username/password authentication if required
- `.Values.noProxy` to any URLs that should _not_ transit the Proxy - this may include internal registries, SCMs, or other systems Broker may interact with.

Other authentication methods are not supported.

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

### Commit Signing

Snyk Broker commit signing is in [Early Access](https://docs.snyk.io/getting-started/snyk-release-process#open-beta). If you would like to use this feature, contact your Snyk representative or team.

This feature requires a GitHub Account that has a GPG key configured for commit signing.

#### Via Helm

Provide the GPG key (exported as an ASCII armored version), the passphrase, and associated email/user:

```yaml
commitSigning:
  name: "Account Name"
  email: "email@company.tld"
  passphrase: "passphrase"
  gpgPrivateKey: -----BEGIN PGP PRIVATE KEY BLOCK-----\n....\n-----END PGP PRIVATE KEY BLOCK-----
```

The Universal Broker Helm Chart creates this secret for you.

#### Via External Secret

First create or otherwise ensure the secret exists:

```yaml
kind: Secret
apiVersion: v1
metadata:
  name: gpg-signing-key
data:
  GPG_PRIVATE_KEY: "-----BEGIN PRIVATE KEY BLOCK-----..."
  GPG_PASSPRHASE: "passphrase"
  GIT_COMMITTER_EMAIL: "user@comapny.io"
  GIT_COMMITTER_NAME: "User Name"
```

The keys **must** match the example above.

Then set values within `.Values.commitSigningSecret` to reference this external Secret:
```yaml
commitSigning:
  enabled: true
commitSigningSecret:
  name: gpg-signing-key
```

Commit signing is enabled if the following entry appears in Universal Broker logs at startup:

```
loading commit signing rules (enabled=true, rulesCount=5)
```

### Broker with TLS

Optionally provide a certificate and key to run Broker behind TLS. This may be useful if an Ingress is not used.

#### Via Helm

```yaml
localWebServer:
  https: true
  certificate: "-----BEGIN CERTIFICATE-----\nYOUR CERTIFICATE HERE\n-----END CERTIFICATE-----"
  key: "-----BEGIN PRIVATE KEY-----\nYOUR KEY HERE\n-----END PRIVATE KEY-----"
```

The Universal Broker Helm Chart creates this secret for you.

#### Via External Secret

First create or otherwise ensure the secret exists:

```yaml
kind: Secret
apiVersion: v1
metadata:
  name: broker-tls
type: kubernetes.io/tls
data:
  tls.crt: "-----BEGIN PRIVATE CERTIFICATE-----\nYOUR CERTIFICATE HERE\n-----END CERTIFICATE-----"
  tls.key: "-----BEGIN PRIVATE KEY-----\nYOUR KEY HERE\n-----END PRIVATE KEY-----"
```

_Note:_ This is of type `kubernetes.io/tls`. If using another format, the keys **must** match the example above.

THen set values within `localWebServerSecret` to reference this external Secret:

```yaml
localWebServerSecret:
  name: broker-tls
```

## Parameters

### Snyk Broker parameters

Refer to documentation via [docs.snyk.io](https://docs.snyk.io/enterprise-setup/snyk-broker/universal-broker/initial-configuration-of-the-universal-broker) to obtain `deploymentId`, `clientId`, `clientSecret` values.

Credential References should contain one or more key/value pairs where each key matches the `environment_variable_name` of a `deployment_credential`, and the value provides the secret. For example:
```bash
helm install ... --set credentialReferences.MY_GITHUB_TOKEN=<gh-pat>
```

| Name                              | Description                                                                                                                                                                      | Value   |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `brokerClientUrl`                 | is the address of the broker. This needs to be the address of itself. In the case of Kubernetes, you need to ensure that you are pointing to the cluster ingress you have setup. | `""`    |
| `region`                          | Optionally specify a Snyk Region - e.g. "eu" for "SNYK-EU-01". Defaults to "SNYK-US-01", app.snyk.io                                                                             | `""`    |
| `preflightChecks.enabled`         | broker client preflight checks                                                                                                                                                   | `true`  |
| `deploymentId`                    | Obtained by installing the Broker App                                                                                                                                            | `""`    |
| `clientId`                        | Obtained by installing the Broker App                                                                                                                                            | `""`    |
| `clientSecret`                    | Obtained by installing the Broker App                                                                                                                                            | `""`    |
| `platformAuthSecret.name`         | Optionally provide an external secret containing three keys: `DEPLOYMENT_ID`, `CLIENT_ID` and `CLIENT_SECRET`                                                                    | `""`    |
| `credentialReferences`            | Credential References to pass to Broker                                                                                                                                          | `{}`    |
| `credentialReferencesSecret.name` | Optionally provide a pre-existing secret with SCM credential reference data                                                                                                      | `""`    |
| `acceptCode`                      | Set to false to block Broker rules relating to Snyk Code analysis                                                                                                                | `true`  |
| `acceptAppRisk`                   | Set to false to block Broker rules relating to AppRisk                                                                                                                           | `true`  |
| `acceptIaC`                       | Defaults to "tf,yaml,yml,json,tpl". Optionally remove any extensions not required. Must be comma separated. Set to "" to block Broker rules relating to Snyk IaC analysis        | `""`    |
| `acceptCustomPrTemplates`         | Set to false to block Broker rules relating to Snyk Custom PR Templates                                                                                                          | `true`  |
| `acceptLargeManifests`            | Set to false to block Broker rules relating to fetching of large files from GitHub/GitHub Enterprise                                                                             | `true`  |
| `commitSigning.enabled`           | Set to true to sign any commits made to GitHub or GitHub Enterprise. Requires `name`, `email`, `passphrase`, `privateKey` _or_ `commitSigningSecret`                             | `false` |
| `commitSigning.name`              | The name to associate with any signed commits                                                                                                                                    | `""`    |
| `commitSigning.email`             | The email to associate with any signed commits                                                                                                                                   | `""`    |
| `commitSigning.gpgPrivateKey`     | The GPG private key to sign commits with (ASCII armored version)                                                                                                                 | `""`    |
| `commitSigning.passphrase`        | The passpharse for the GPG key                                                                                                                                                   | `""`    |
| `commitSigningSecret`             | An external secret containing `GIT_COMMITTER_NAME`, `GIT_COMMITTER_EMAIL`, `GPG_PASSPHRASE` and `GPG_PRIVATE_KEY`                                                                | `""`    |

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

| Name                                        | Description                                                                                 | Value                      |
| ------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------- |
| `ingress.enabled`                           | Set to true to create an Ingress                                                            | `false`                    |
| `ingress.className`                         | Optionally define an Ingress Class                                                          | `""`                       |
| `ingress.annotations`                       | Additional annotations for the Ingress resource                                             | `{}`                       |
| `ingress.path`                              | sets the path associated with the ingress                                                   | `"/"`                      |
| `ingress.pathType`                          | sets the path type associated with the ingress                                              | `"ImplementationSpecific"` |
| `ingress.hostname`                          | define the host associated with this ingress - add Broker_client_url here                   | `"broker.local"`           |
| `ingress.extraHosts`                        | An array with additional hostname(s) to be covered with the ingress record                  | `[]`                       |
| `ingress.extraPaths`                        | Any additional arbitrary paths that may need to be added to the ingress under the main host | `[]`                       |
| `ingress.extraTls`                          | Any additional tls entries to add to the ingress                                            | `[]`                       |
| `ingress.extraRules`                        | Any additional rules to add to the ingress                                                  | `[]`                       |
| `ingress.secrets`                           | A list of TLS secrets to create, each with `name`, `key` and `certificate`                  | `[]`                       |
| `ingress.tls.enabled`                       | Set to true to enable TLS on the in-built ingress                                           | `false`                    |
| `ingress.tls.existingSecret`                | Specify an existing TLS secret to use with this ingress                                     | `""`                       |
| `resources.requests.cpu`                    | Set CPU requests                                                                            | `1`                        |
| `resources.requests.memory`                 | Set memory requests                                                                         | `512Mi`                    |
| `resources.limits.cpu`                      | Set CPU limits                                                                              | `2`                        |
| `resources.limits.memory`                   | Set memory limits                                                                           | `1024Mi`                   |
| `highAvailabilityMode.enabled`              | snyk [default: true] Set to false to disable High Availability Mode for Broker              | `true`                     |
| `highAvailabilityMode.replicaCount`         | Number of Broker pods when running in HA mode (min 2, max 4)                                | `2`                        |
| `commonLabels`                              | Labels to add to all deployed objects (sub-charts are not considered)                       | `{}`                       |
| `commonAnnotations`                         | Annotations to add to all deployed objects (sub-charts are not considered)                  | `{}`                       |
| `podLabels`                                 | Pod labels                                                                                  | `{}`                       |
| `livenessProbe.enabled`                     | Enable livenessProbe                                                                        | `true`                     |
| `livenessProbe.path`                        | Path for the livenessProbe                                                                  | `/healthcheck`             |
| `livenessProbe.config.initialDelaySeconds`  | Initial delay seconds for livenessProbe                                                     | `3`                        |
| `livenessProbe.config.periodSeconds`        | Period seconds for livenessProbe                                                            | `10`                       |
| `livenessProbe.config.timeoutSeconds`       | Timeout seconds for livenessProbe                                                           | `1`                        |
| `livenessProbe.config.failureThreshold`     | Failure threshold for livenessProbe                                                         | `3`                        |
| `readinessProbe.enabled`                    | Enable readinessProbe                                                                       | `true`                     |
| `readinessProbe.path`                       | Path for the readinessProbe                                                                 | `/healthcheck`             |
| `readinessProbe.config.initialDelaySeconds` | Initial delay seconds for readinessProbe                                                    | `3`                        |
| `readinessProbe.config.periodSeconds`       | Period seconds for readinessProbe                                                           | `10`                       |
| `readinessProbe.config.timeoutSeconds`      | Timeout seconds for readinessProbe                                                          | `1`                        |
| `readinessProbe.config.failureThreshold`    | Failure threshold for readinessProbe                                                        | `3`                        |
| `logLevel`                                  | defines Log Level for broker client pod. Can be set to "debug" for more information         | `info`                     |
| `logEnableBody`                             | adds additional logging by setting to true                                                  | `false`                    |

### Serving over HTTPS and Certificate Trust

| Name                         | Description                                                                                    | Value                 |
| ---------------------------- | ---------------------------------------------------------------------------------------------- | --------------------- |
| `localWebServer.https`       | enables Broker client to run a HTTPS server instead of the default HTTP server                 | `false`               |
| `localWebServer.certificate` | Provide HTTPS cert                                                                             | `""`                  |
| `localWebServer.key`         | Provides HTTPS cert key                                                                        | `""`                  |
| `localWebServerSecret.name`  | the name of the secret to create or (if cert and key are empty) the existing TLS secret to use | `""`                  |
| `caCert`                     | Set caCert to read certificate content from the values.yaml file as a multiline string:        | `""`                  |
| `caCertMount.path`           | the path to mount a certificate bundle to                                                      | `"/home/node/cacert"` |
| `caCertMount.name`           | the filename to write a certificate bundle to                                                  | `"cacert"`            |
| `caCertSecret.name`          | set to read a CA cert from an external secret                                                  | `""`                  |
| `caCertSecret.caCertKey`     | set to read the ca cert from a different key                                                   | `ca.pem`              |
| `disableAllCertificateTrust` | Set to `true` to disable trust of **all** certificates, including any provided CAs             | `false`               |

### Proxy Configuration

| Name                        | Description                                                                                                                                                        | Value |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----- |
| `httpProxy`                 | Set to proxy any http-only traffic. You probably need to use HTTPS proxy setting and leave this blank                                                              | `""`  |
| `httpsProxy`                | HTTPS Proxy URL. Optionally provide user/password auth in the url (http(s)://[username]:[password]@my.proxy:[port]). No other authentication schemes are supported | `""`  |
| `noProxy`                   | A comma-separated list of hostnames that must not transit a proxy. Do not include protocol or port numbers                                                         | `""`  |
| `proxySecret.name`          | The name of a pre-existing secret containing up to three entries. If set, supersedes `.Values.httpProxy`, `.Values.httpsProxy` and `.Values.noProxy`               | `""`  |
| `proxySecret.httpProxyKey`  | Specify the key within the pre-existing secret containing the value for HTTP_PROXY. If left empty, no value is set                                                 | `""`  |
| `proxySecret.httpsProxyKey` | Specify the key within the pre-existing secret containing the value for HTTPS_PROXY. If left empty, no value is set                                                | `""`  |
| `proxySecret.noProxyKey`    | Specify the key within the pre-existing secret containing the value for NO_PROXY. If left empty, no value is set                                                   | `""`  |

### Image Registry

| Name                | Description                                        | Value          |
| ------------------- | -------------------------------------------------- | -------------- |
| `image.registry`    | Broker image registry                              | `docker.io`    |
| `image.repository`  | Broker image repository                            | `snyk/broker`  |
| `image.tag`         | Broker image tag                                   | `universal`    |
| `image.pullPolicy`  | Broker image pull policy                           | `IfNotPresent` |
| `image.pullSecrets` | Optionally provide any existing image pull secrets | `[]`           |

### Service Account

| Name                                                | Description                                                                                  | Value              |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------ |
| `serviceAccount.create`                             | Enable creation of a serviceAccount                                                          | `true`             |
| `serviceAccount.existingName`                       | Optionally provide an existing serviceAccount name                                           | `""`               |
| `serviceAccount.annotations`                        | Additional custom annotations for the serviceAccount                                         | `{}`               |
| `serviceAccount.name`                               | The name of the serviceAccount to create. If not set and create is true, a name is generated | `""`               |
| `podSecurityContext.enabled`                        | Enable security context for Broker Pods                                                      | `true`             |
| `podSecurityContext.fsGroupChangePolicy`            | Set filesystem group change policy                                                           | `Always`           |
| `podSecurityContext.sysctls`                        | Set kernel settings using the sysctl interface                                               | `[]`               |
| `podSecurityContext.supplementalGroups`             | Set filesystem extra groups                                                                  | `[]`               |
| `podSecurityContext.fsGroup`                        | Group ID for the volumes of the pod                                                          | `1000`             |
| `containerSecurityContext.enabled`                  | Enable Broker container security context                                                     | `true`             |
| `containerSecurityContext.seLinuxOptions`           | Set SELinux options for Broker container                                                     | `{}`               |
| `containerSecurityContext.runAsUser`                |                                                                                              | `1000`             |
| `containerSecurityContext.runAsGroup`               |                                                                                              | `1000`             |
| `containerSecurityContext.allowPrivilegeEscalation` | Allow the Broker container to escalate privileges                                            | `false`            |
| `containerSecurityContext.capabilities.drop`        | ] Linux capabilities to drop                                                                 | `""`               |
| `containerSecurityContext.readOnlyRootFilesystem`   | Must be set to false; Broker will write configuration to filesystem upon startup             | `false`            |
| `containerSecurityContext.runAsNonRoot`             | Run Broker as non-root                                                                       | `true`             |
| `containerSecurityContext.privileged`               | Run Broker as a privileged container                                                         | `false`            |
| `containerSecurityContext.seccompProfile.type`      | Set the `seccomProfile` for Broker                                                           | `"RunTimeDefault"` |
| `extraVolumes`                                      | Optionally specify extra list of additional volumes for Broker container                     | `[]`               |
| `extraVolumeMounts`                                 | Optionally specify extra list of additional volumeMounts for Broker container                | `[]`               |
| `extraEnvVars`                                      | Optionally specify extra list of additional environment variables for Broker container       | `[]`               |

