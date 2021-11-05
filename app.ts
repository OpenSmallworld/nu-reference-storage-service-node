import express, {Application, Request, Response} from 'express'
import {v1} from 'uuid';
import fs from "fs";

const app: Application = express();

const port = process.env.PORT || 4001;

app.use(express.raw({type: 'image/*', limit: '1gb'}));

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});

/**
 * Simple status API to quickly check if your app is up and running.
 */
app.get('/v1/status', (request: Request, response: Response) => {
  response.status(200).json({
    status: 'Running'
  });
});

/**
 * POST /v1/files?type=image&featureId={id}
 */
app.post('/v1/files', (request: Request, response: Response) => {

  // Validate query params

  const queryParams = request.query;

  if (!queryParams) {
    return response.send(400).send('Required query params: type, featureId');
  }

  const typeQueryParam = queryParams.type;
  if (!isString(typeQueryParam) || (typeQueryParam as string).trim() === '') {
    return response.status(400).send('type is required query param');
  }

  const featureIdQueryParam = queryParams.featureId;
  if (!isString(featureIdQueryParam) || (featureIdQueryParam as string).trim() === '') {
    return response.status(400).send('featureId is required query param');
  }

  // Validate there is image data

  const rawFile: Buffer = request.body;
  if (!rawFile || rawFile.length === 0) {
    return response.status(400).send('No file found');
  }
  console.log({rawFile});

  // Validate the Content-Type

  const contentType = request.header('Content-Type');
  console.log({contentType});
  if (contentType === undefined) {
    return response.status(400).send('Content-Type header is required');
  }
  if (!contentType.startsWith('image/')) {
    return response.status(400).send("Content-Type not supported.  Supported content types: 'image/*'")
  }

  // Generate filename

  const fileExt = contentType.split('/')[1];
  const filename = `image-${featureIdQueryParam}-${v1()}.${fileExt}`;

  // Write image to file

  fs.writeFile(filename, rawFile, (err) => {
    if (err) return console.error(err)
    console.log('file saved to ', filename);
  });

  // Return url as response

  const responseJson = {filePath: `${filename}`};
  response.json(responseJson);
  console.log(responseJson);
});

function isString(value) : boolean {
  return typeof value === 'string' || value instanceof String;
}

