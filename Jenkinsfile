#!/usr/bin/env groovy
@Library('sfc-build-pipeline@node16') _
npmBuildPipeline({
  projectName = 'nu-reference-storage-service-node'
  nodeVersion = '16.13.0'
  dockerImageName = 'nu-reference-storage-service-node'
  targetDockerRegistry = 'dtr.predix.io'
  targetDockerRegistryCredentials = 'predix_dtr_creds'
  secondaryDockerRegistryCredentials = 'grid_arti_dtr'
  secondaryDockerRegistry = 'dig-grid-artifactory.apps.ge.com'
  secondaryDockerRepository = 'smallworld-docker-snapshot'
  secondaryDockerImageName = 'nu-reference-storage-service-node'
  secondaryDockerImageTag = 'SW531-DEV'
  crossPublishDockerImage = true
  securityAudit = false
  sonarScan = false
  lint = false
  ossLicenceCheck = false
})
