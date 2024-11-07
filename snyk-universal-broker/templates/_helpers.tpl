{{/*
Create the name of the service account to use
*/}}
{{- define "snyk-broker.serviceaccountName" -}}
{{- if .Values.serviceaccount.create }}
{{- default ( include "common.names.fullname" . ) .Values.serviceaccount.name }}
{{- else }}
{{- default "default" .Values.serviceaccount.name }}
{{- end }}
{{- end }}

{{/*
Return the correct broker server URL based on the tenant value.
*/}}
{{- define "snyk-broker.brokerServerUrl" }}
  {{- $tenant := .Values.tenant | default "default" -}}
  {{- if eq $tenant "default" -}}
    https://broker.snyk.io
  {{- else -}}
    {{- printf "https://broker.%s.snyk.io" $tenant -}}
  {{- end -}}
{{- end }}

{{/*
Return the correct broker dispatcher URL based on the tenant value.
*/}}
{{- define "snyk-broker.brokerDispatcherUrl" }}
  {{- $tenant := .Values.tenant | default "default" -}}
  {{- if eq $tenant "default" -}}
    https://api.snyk.io
  {{- else -}}
    {{- printf "https://api.%s.snyk.io" $tenant -}}
  {{- end -}}
{{- end }}

{{- define "snyk-broker.replicas" -}}
  {{- if .Values.highAvailabilityMode.enabled -}}
    {{- if gt (int .Values.replicaCount) 4 -}}
      {{- fail "Cannot have more than 4 replicas in High Availability mode." -}}
    {{- else -}}
      {{- print (int .Values.replicaCount) -}}
    {{- end -}}
  {{- else -}}
    {{- print 1 -}}
  {{- end -}}
{{- end -}}

{{- define "snyk-broker.validateImagePullPolicy" -}}
  {{- $validPolicies := list "IfNotPresent" "Always" "Never" -}}
  {{- $policy := .Values.image.pullPolicy -}}
  {{- if not (or (eq $policy "IfNotPresent") (eq $policy "Always") (eq $policy "Never")) -}}
    {{- fail (printf "Invalid imagePullPolicy: %s. Allowed values are: IfNotPresent, Always, Never." $policy) -}}
  {{- end -}}
{{- end -}}

{{/*
Create a secret name.
Pass a dict of Context ($) and secretName:
include "snyk-broker.genericSecretName" (dict "Context" $ "secretName" "secret-name")
*/}}
{{- define "snyk-broker.genericSecretName" -}}
{{ printf "%s-%s" .Context.Release.Name .secretName | trunc 63 | trimSuffix "-" }}
{{- end -}}

{{/*
Create a name for the CA Cert secret, using a provided override if present
*/}}
{{- define "snyk-broker.caCertSecretName" -}}
{{- .Values.caCertSecret.name | default ( include "snyk-broker.genericSecretName" (dict "Context" . "secretName" "cacert-secret" ) ) -}}
{{- end }}

{{/*}}
Snyk Broker ACCEPT_ vars
*/}}
{{- define "snyk-broker.accepts" -}}
{{- $accetpableIacExtensions := list "tf" "yaml" "yml" "json" "tpl" -}}
{{ if .Values.acceptAppRisk }}
- name: ACCEPT_APPRISK
  value: "true"
{{- end }}
{{- if .Values.acceptCode }}
- name: ACCEPT_CODE
  value: "true"
{{- end }}
{{- if .Values.acceptLargeManifests }}
- name: ACCEPT_LARGE_MANIFESTS
  value: "true"
{{- end }}
{{- if .Values.acceptCustomPrTemplates }}
- name: ACCEPT_CUSTOM_PR_TEMPLATES
  value: "true"
{{- end }}
{{- if .Values.acceptIaC }}
{{- range ( .Values.acceptIaC | nospace | split "," ) -}}
{{- if not ( has . $accetpableIacExtensions ) -}}
{{- fail ( printf "Unrecognised extension for ACCEPT_IAC: %s" . ) -}}
{{- end }}
{{- end }}
- name: ACCEPT_IAC
  value: {{ printf "%s" .Values.acceptIaC }}
{{- end }}
{{- end }}
