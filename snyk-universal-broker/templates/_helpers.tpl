{{/*
Create the name of the service account to use
*/}}
{{- define "snyk-broker.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default ( include "common.names.fullname" . ) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Return the correct broker server URL based on the tenant value.
*/}}
{{- define "snyk-broker.brokerServerUrl" -}}
  {{- if eq .Values.tenant "EU" -}}
    "https://broker.eu.snyk.io"
  {{- else if eq .Values.tenant "AU" -}}
    "https://broker.au.snyk.io"
  {{- else if or (eq .Values.tenant "default") (eq .Values.tenant "") -}}
    "https://broker.snyk.io"
  {{- else -}}
    "https://broker.{{ .Values.tenant }}"
  {{- end }}
{{- end }}

{{/*
Return the correct broker dispatcher URL based on the tenant value.
*/}}
{{- define "snyk-broker.brokerDispatcherUrl" -}}
  {{- if eq .Values.tenant "EU" -}}
    "https://api.eu.snyk.io"
  {{- else if eq .Values.tenant "AU" -}}
    "https://api.au.snyk.io"
  {{- else if or (eq .Values.tenant "default") (eq .Values.tenant "") -}}
    "https://api.snyk.io"
  {{- else -}}
    "https://api.{{ .Values.tenant }}"
  {{- end }}
{{- end }}