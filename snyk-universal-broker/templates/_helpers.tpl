{{/*
Create the name of the service account to use
*/}}
{{- define "snyk-broker.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default ("common.names.fullname" ) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create a secret name.
Pass a dict of Context ($) and secretName:
include "snyk-broker.genericSecretName" (dict "Context" $ "secretName" "secret-name")
*/}}
{{- define "snyk-broker.genericSecretName" -}}
{{- if not .Context.Values.disableSuffixes -}}
{{ printf "%s-%s" ( include "snyk-broker.fullname" .Context ) .secretName }}
{{- else -}}
{{- printf "snyk-broker-%s" .secretName }}
{{- end -}}
{{- end -}}

{{- define "snyk-broker.tlsSecretName" -}}
{{- include "snyk-broker.genericSecretName" (dict "Context" . "secretName" "tls-secret" ) -}}
{{- end }}

{{- define "snyk-broker.caCertSecretName" -}}
{{- include "snyk-broker.genericSecretName" (dict "Context" . "secretName" "cacert-secret" ) -}}
{{- end }}
