# Network Update Reference Storage Service - Node.js

> **_WARNING:_**  It is critical to note that the Reference Storage Service is not production ready code.  It is the simplest working demo we could provide.  It uses temporary container storage (the data is lost anytime the container is restarted) and does not do any security validation or virus scanning of file content itself.  The details of a production implementation are the sole responsibility of the customer implementing and deploying the custom storage solution.

Example storage service with Node.js, Express, and TypeScript.

## Build

> **_NOTE:_** There is a pre-built image available for use by GE employees at https://registry.gear.ge.com/repositories/pwr-smallworld/nu-reference-storage-service-node.  For demos you should check the repo for the most recent `SW5210-DEV-*` version to pull or build the image yourself.

`npm ci`

then

`npm run build`

## Run in prod mode

`npm run start`

## Run in dev mode

To start the app with hot reloading:

`npm run dev`


## Run Tests

`npm run test`

## Config

### Environment Vars

| Variable | Description | Default Value |
| ----------- | ----------- | ----------- |
| `PORT` | Port the Reference Storage Service is accessible on | 4000 |
| `STORAGE_SERVICE_API_BASE_PATH` | Base path which prefixes all urls. | nu-storage |
| `FILE_SIZE_LIMIT` | Max size for saving a single file. | 1gb |
| `STORAGE_DEMO_API_BASE_PATH` | Base path which prefixes the demo only read file endpoint. | nu-storage-demo |
| `STORAGE_DEMO_BASE_URL` | Host + port of the demo read files endpoint. | http://localhost:4000 |
| `STORAGE_DEMO_DOWNLOAD_TYPE` | Download options when reading files.  For demo purposes, you can open in the browser (with the default 'open' option), or download as an attachment (by overriding with 'attachment') | open |

By default, app runs with a path of `http://localhost:4000/nu-storage`

### (Optional) Run with debug logs

To enable debug logging, set the following env var prior to running the app.

Optionally to run with debug options:

`export DEBUG=express:*`

## APIs

### Check if storage service is running (FOR DEMO PURPOSES ONLY!!!)

`GET <storage base path>/v1/status`

For example, http://localhost:4000/nu-storage/v1/status

### Save a file (the API you must implement)

`POST <storage base path>/v1/files?type=image&featureId={id}`

`Accepts: image/*`

For example, http://localhost:4000/nu-storage/v1/files?type=image&featureId=xxxxxx

#### Query Params

| Query Param | Description | Required |
| ----------- | ----------- | ----------- |
| `type` | Type of file being saved.  Only supported file type: `image` | Yes |
| `featureId` | Urn of the feature the file is associated with | Yes |

#### Response Statuses

| HTTP Status | Description |
| ----------- | ----------- |
| `201 Created` | If file is saved successfully |
| `400 Bad Request` | If any part of the request is invalid, for example if the query params or file data is missing |
| `500 Internal Server Error` | Unexpected exception occurred |

#### Response Body

```json
{
  "filePath": "string"
}
```

#### Error Response

```json
{
  "statusCode": "number",
  "errors": [
    "string"
  ]
}
```

| Error Response Field | Description  | Type |
| ----------- | ----------- | ----------- |
| `statusCode` | The HTTP status code | number |
| `errors` | One or more descriptive messages about the error which occurred | string array |


### Check if read file service is running (FOR DEMO PURPOSES ONLY!!!)

`GET <storage demo base path>/v1/status`

For example, http://localhost:4000/nu-storage-demo/v1/status

### Read a file (FOR DEMO PURPOSES ONLY!!!)

`GET <storage demo base path>/v1/files?filePath=<url encoded filepath>`

For example, http://localhost:4000/nu-storage-demo/v1/files?filePath=%2Fnu-reference-storage-service-node%2Fsrc%2Fimage%2F333-ff36f800-4660-11ec-b840-4f0ea6969635.png

#### Query Params

| Query Param | Description | Required |
| ----------- | ----------- | ----------- |
| `filePath` | Path of where file is stored within image | Yes |

#### Response Statuses

| HTTP Status | Description |
| ----------- | ----------- |
| `200 Created` | If file returned successfully |
| `400 Bad Request` | If any part of the request is invalid, for example if the query params are missing |
| `404 Not Found` | If requested file does not exist |
| `500 Internal Server Error` | Unexpected exception occurred |

#### Response Body

Produces: image/*
Raw contents of file.

```json
{
  "statusCode": "number",
  "errors": [
    "string"
  ]
}
```

| Error Response Field | Description  | Type |
| ----------- | ----------- | ----------- |
| `statusCode` | The HTTP status code | number |
| `errors` | One or more descriptive messages about the error which occurred | string array |

## OSS Notice

| Library | License  | Url |
| ------- | -------- | --- |
| express | MIT | https://github.com/expressjs/express/blob/master/LICENSE |
| form-data | MIT | https://github.com/form-data/form-data/blob/master/License |
| http-status-codes | MIT | https://github.com/prettymuchbryce/http-status-codes/blob/master/LICENSE |
| mime-types | MIT | https://github.com/jshttp/mime-types/blob/master/LICENSE |
| morgan | MIT | https://github.com/expressjs/morgan/blob/master/LICENSE |
| uuid | MIT | https://github.com/uuidjs/uuid/blob/main/LICENSE.md |
