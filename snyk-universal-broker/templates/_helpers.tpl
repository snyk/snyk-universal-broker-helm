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
Return the proper universal-broker image name
*/}}
{{- define "universal-broker.image" -}}
{{ include "common.images.image" (dict "imageRoot" .Values.image) }}
{{- end -}}