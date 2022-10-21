#!/usr/bin/env groovy
@Library('sfc-build-pipeline@node16') _
npmBuildPipeline({
  projectName = 'nu-reference-storage-service-node'
  nodeVersion = '16.17.0'
  dockerImageName = 'nu-reference-storage-service-node'
  securityAudit = false
  sonarScan = false
  lint = false
  ossLicenceCheck = false
})
