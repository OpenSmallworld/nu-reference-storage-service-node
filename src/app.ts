import express, {Application, Request, Response} from 'express';
import {v1} from 'uuid';
import fs from 'fs';
import {ErrorResponseDto} from './error-response.dto';
import {StatusCodes} from 'http-status-codes';
import mime from 'mime';
import querystring from 'querystring';

const app: Application = express();

const port = process.env.PORT || 4000;
const apiBasePath = process.env.STORAGE_BASE_PATH || 'nu-storage';
const readFileBaseUrl = process.env.READ_FILE_BASE_URL || `http://localhost:${port}`;
const fileSizeLimit = process.env.FILE_SIZE_LIMIT || '1gb';

app.use(express.raw({type: 'image/*', limit: fileSizeLimit}));

app.listen(port, () => {
  console.log(`App is listening on port: ${port}`);
  console.log(`App configuration:`);
  console.log({
    PORT: port,
    STORAGE_BASE_PATH: apiBasePath,
    READ_FILE_BASE_URL: readFileBaseUrl,
    FILE_SIZE_LIMIT: fileSizeLimit
  });
});

/**
 * GET <storage base path>/v1/status
 * Simple status API to quickly check if your service is up and running.
 */
app.get(`/${apiBasePath}/v1/status`, (request: Request, response: Response) => {
  response.status(StatusCodes.OK).json({
    name: 'Network Update Reference Storage Service',
    status: 'Running'
  });
});

/**
 * POST <storage base path>/v1/files
 * Query Params:
 *   type=image -- Required
 *   featureId={id} -- Required
 * Accepts: image/*
 */
app.post(`/${apiBasePath}/v1/files`, async (request: Request, response: Response) => {
  console.log('Received save file request');

  try {
    // Validate query params
    const queryParams = request.query;

    if (queryParams === undefined) {
      return response.status(StatusCodes.BAD_REQUEST).json(badRequestError('Required query params: type, featureId'));
    }

    const typeQueryParam = queryParams.type;
    if (typeQueryParam === undefined || !isString(typeQueryParam) || (typeQueryParam as string).trim() === '') {
      return response.status(StatusCodes.BAD_REQUEST).json(badRequestError('type is required query param'));
    }

    if ((typeQueryParam as string).trim().toLowerCase() !== 'image') {
      return response.status(StatusCodes.BAD_REQUEST).json(badRequestError(`Supported values for 'type': image`));
    }

    const featureIdQueryParam = queryParams.featureId;
    if (featureIdQueryParam === undefined || !isString(featureIdQueryParam) || (featureIdQueryParam as string).trim() === '') {
      return response.status(StatusCodes.BAD_REQUEST).json(badRequestError('featureId is required query param'));
    }

    // Validate the Content-Type

    const contentType = request.header('Content-Type');
    console.debug({contentType});
    if (contentType === undefined) {
      return response.status(StatusCodes.BAD_REQUEST).json(badRequestError('Content-Type header is required'));
    }

    if (!request.is('image/*')) {
      return response.status(StatusCodes.BAD_REQUEST).json(badRequestError(`Content-Type '${contentType}' not supported.  Supported content types: image/*`))
    }

    // Validate there is image data

    const rawFile: Buffer = request.body;
    if (rawFile === undefined || !rawFile.length) {
      return response.status(StatusCodes.BAD_REQUEST).json(badRequestError('No file found'));
    }

    // Generate filename for image

    const fileDirectory = `${__dirname}/${typeQueryParam}`;

    if (!fs.existsSync(fileDirectory)) {
      await fs.promises.mkdir(fileDirectory);
    }

    const filename = `${fileDirectory}/${featureIdQueryParam}-${v1()}.${mime.extension(contentType)}`;

    // Write image to file

    /*
    THIS IS NOT PRODUCTION READY CODE.
    THIS IS A SIMPLE DEMO EXAMPLE WHICH SAVES TO TEMPORARY NON-PERSISTENT CONTAINER STORAGE.
    REPLACE THIS CODE WITH YOUR PRODUCTION READY REQUIREMENTS
     */

    let debugInfo = {
      fileDirectory: fileDirectory,
      filename: filename,
      dirName: __dirname,
    }

    console.debug(debugInfo);

    await fs.promises.writeFile(filename, rawFile);
    console.log(`File saved to ${filename}`);

    // convert save location to accessible url

    const fileUrl = `${readFileBaseUrl}/${apiBasePath}/v1/files?${querystring.stringify({filePath: filename})}`;
    console.log({fileUrl});

    // Return url as response
    response.status(StatusCodes.CREATED)
    .json({
      filePath: `${fileUrl}`
    });

  } catch (e) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json(internalServerError(e.message));
  }
});

/**
 * GET <storage base path>/v1/files?filePath=<filePath>
 */
app.get(`/${apiBasePath}/v1/files`, async (request: Request, response: Response) => {

  // Validate query params
  const queryParams = request.query;

  if (queryParams === undefined) {
    return response.status(StatusCodes.BAD_REQUEST).json(badRequestError('Required query params: filePath'));
  }

  const filePathQueryParam = queryParams.filePath;
  if (filePathQueryParam === undefined || !isString(filePathQueryParam) || (filePathQueryParam as string).trim() === '') {
    return response.status(StatusCodes.BAD_REQUEST).json(badRequestError('filePath is required query param'));
  }
  const filePath = filePathQueryParam as string;

  console.log({filePath});

  response.status(StatusCodes.OK).download(filePath);
});

function isString(value): boolean {
  return typeof value === 'string' || value instanceof String;
}

function internalServerError(message: string): ErrorResponseDto {
  return {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    errors: [message],
  };
}

function badRequestError(message: string): ErrorResponseDto {
  return {
    statusCode: StatusCodes.BAD_REQUEST,
    errors: [message],
  };
}

export default app;

