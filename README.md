# nu-reference-storage-service-express

## Build & Run

`npm install`

Optionally to run with debug options:

`export DEBUG="express:* node index.js"`

Then to start the app:

`npm run serve`

By default, runs on port 4001, with a full path of `http://localhost:4001`

## APIs

### Check if app is running

`GET /v1/status`

For example, http://localhost:4001/v1/status

### Save a file

`POST /v1/files?type=image&featureId={id}`

For example, http://localhost:4001/v1/files?type=image&featureId=xxxxxx
