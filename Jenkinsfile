#!/usr/bin/env groovy
@Library('sfc-build-pipeline@node16') _
npmBuildPipeline({
  projectName = 'nu-reference-storage-service-node'
  nodeVersion = '16.13.0'
  targetDockerRegistry = 'dtr.predix.io'
  targetDockerRegistryCredentials = 'predix_dtr_creds'
  dockerImageName = 'nu-reference-storage-service-node'
  secondaryDockerRegistryCredentials = 'grid_arti_dtr'
  secondaryDockerRegistry = 'dig-grid-artifactory.apps.ge.com'
  secondaryDockerRepository = 'smallworld-docker-snapshot'
  secondaryDockerImageName = 'nu-reference-storage-service-node'
  secondaryDockerImageTag = 'SW5210-DEV'
  crossPublishDockerImage = true
  securityAudit = false
  sonarScan = false
  unitTest = false
  lint = false
  ossLicenceCheck = false
})
