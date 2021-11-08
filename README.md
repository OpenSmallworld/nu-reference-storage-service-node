# Network Update Reference Storage Service - Node.js

Example storage service with but Node.js, Express, and TypeScript.

## Build & Run

`npm ci`

Optionally to run with debug options:

`export DEBUG="express:* node index.js"`

### Run in prod mode

`npm run build`

then

`npm run start`

### Run in dev mode

Then to start the app in dev mode with hot reloading:

`npm run dev`


By default, runs on port 4001, with a full path of `http://localhost:4001`

## APIs

### Check if app is running

`GET /v1/status`

For example, http://localhost:4000/v1/status

### Save a file

`POST /v1/files?type=image&featureId={id}`

For example, http://localhost:4000/v1/files?type=image&featureId=xxxxxx
