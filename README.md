# Network Update Reference Storage Service - Node.js

Example storage service with but Node.js, Express, and TypeScript.

## Build & Run

`npm ci`

### (Optional) Run with debug logs

To enable debug logging, set the following env var prior to running the app.

Optionally to run with debug options:

`export DEBUG="express:* node index.js"`

### Run in prod mode

`npm run build`

then

`npm run start`

### Run in dev mode

To start the app with hot reloading:

`npm run dev`

### Default config

By default, runs on port 4000, with a full path of `http://localhost:4000`

## APIs

### Check if app is running

`GET /v1/status`

For example, http://localhost:4000/v1/status

### Save a file

`POST /v1/files?type=image&featureId={id}`

For example, http://localhost:4000/v1/files?type=image&featureId=xxxxxx
