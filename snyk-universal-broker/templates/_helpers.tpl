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