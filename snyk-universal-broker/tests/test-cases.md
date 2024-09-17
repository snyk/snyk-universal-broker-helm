# Metadata
- [ ] I can provide arbitrary annotations
- [ ] I can provide arbitrary labels

# Pod
- [ ] I can provide pod-level annotations
- [ ] I can provide pod-level labels

# Image Pull
- [ ] I can provide my own external ImagePullSecret
- [ ] I can provide multiple imagePullSecret(s)
- [ ] I can provide a custom image registry
- [ ] I can provide a custom image repository
- [ ] I can override the version
- [ ] I can set my own image pull policy

# Pod Runtime
- [ ] I can provide my own security context
- [ ] I can add a pod security context, specific to Broker
- [ ] I can add tolerations
- [ ] I can add nodeSelectors
- [ ] I can add affinities/anti-affinities
- [ ] I can set my own runAsUser, runAsGroup, etc.

# SA
- [ ] I can enable the service account
- [ ] I can use an existing service account

# Overrides

# Resources
- [ ] I can specify my own limits
- [ ] I can specify my own requests

# Statefulset
- [ ] I can set replicas (>1 == HA Mode)

# OpenShift

# Proxy/Egress
- [ ] I can specify my own external proxy
- [ ] I can specify my external proxy address from a secret (username/password auth)
- [ ] I can specify urls that do _not_ transit the proxy
- [ ] I can trust a certificate that the proxy presents
- [ ] I can ignore a certificate that the proxy presents

# Other Networking
- [ ] I can set arbitrary hostAliases on the pod

# Tenancy
- [ ] I can set which Snyk Tenant I am using (EU, AU, my.<>, etc.)

# Broker Parameters

# Broker Connection Parameters

# Ingress Parameters
- [ ] I can specify my Broker serves traffic over https
- [ ] I can specify an alternative port
- [ ] I can use an inbuilt Ingress
- [ ] I can set an ingressClassName
- [ ] I can set my ingress host
- [ ] I can add extra paths
- [ ] I can add extra hosts
- [ ] I can set an ingress path type
- [ ] I can set an ingress path

- [ ] I can provide ingress-specific labels/annotations
- [ ] I can specify an existing secret for tls

# Service
- [ ] I can set my service type
- [ ] I can set my service port
- [ ] I can set extra ports
- [ ] I can 

# Extras
- [ ] I can specify arbitrary environment variables
- [ ] I can specify arbitrary configmaps containing environment variables
- [ ] I can specify arbitrary secrets containing environment variables


### Stretch Goals ###

- [ ] I can provide a runtimeClass
- [ ] I can provide a priorityClassName

- [ ] I can provide sidecars
- [ ] I can provide initContainers
