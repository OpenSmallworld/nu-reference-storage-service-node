#!/usr/bin/env groovy
@Library('sfc-build-pipeline@node20') _
npmBuildPipeline({
  projectName = 'nu-reference-storage-service-node'
  nodeVersion = '20.9.0'
  dockerImageName = 'nu-reference-storage-service-node'
  securityAudit = false
  sonarScan = false
  lint = false
  ossLicenceCheck = false
})
