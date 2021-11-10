# Network Update Reference Storage Service - Node.js

Example storage service with but Node.js, Express, and TypeScript.

## Build

`npm ci`

## Config

### Environment Vars

| Variable | Description | Default Value |
| ----------- | ----------- | ----------- |
| `PORT` | Port the Reference Storage Service is accessible on | 4000 |
| `STORAGE_BASE_PATH` | Base path which prefixes all urls. | nu-storage |

By default, app runs with a path of `http://localhost:4000/nu-storage`

### (Optional) Run with debug logs

To enable debug logging, set the following env var prior to running the app.

Optionally to run with debug options:

`export DEBUG="express:* node index.js"`

## Run in prod mode

`npm run build`

then

`npm run start`

## Run in dev mode

To start the app with hot reloading:

`npm run dev`

## APIs

### Check if app is running

`GET <storage base path>/v1/status`

For example, http://localhost:4000/nu-storage/v1/status

### Save a file

`POST <storage base path>/v1/files?type=image&featureId={id}`
`Accepts: image/*`

For example, http://localhost:4000/nu-storage/v1/files?type=image&featureId=xxxxxx

#### Query Params

| Query Param | Description | Required |
| ----------- | ----------- | ----------- |
| `type` | Type of file being saved.  Only supported file type: `image` | Yes |
| `featureId` | Urn of the feature the file is associated with | Yes |

#### Response Statuses

`201 Created` - If file is saved successfully
`400 Bad Request` - If any part of the request is invalid, for example if the query params or file data is missing
`500 Internal Server Error` - unexpected exception occurred

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
  "errorCode": "string",
  "errors": [
    "string"
  ]
}
```

| Error Response Field | Description  | Type |
| ----------- | ----------- | ----------- |
| `statusCode` | The HTTP status code | number |
| `errorCode` | Optional custom error code | string |
| `errors` | One or more descriptive messages about the error which occurred | string array |
