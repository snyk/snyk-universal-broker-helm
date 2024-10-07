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