import express, {Application, Request, Response} from 'express';
import {v1} from 'uuid';
import fs from 'fs';
import {ErrorResponseDto} from './error-response.dto';
import {StatusCodes} from 'http-status-codes';
import mime from 'mime';
import querystring from 'querystring';
import morgan from 'morgan';

const app: Application = express();

const config = {
  port: process.env.PORT || 4000,
  storageServiceApiBasePath: process.env.STORAGE_SERVICE_API_BASE_PATH || 'nu-storage',
  fileSizeLimit: process.env.FILE_SIZE_LIMIT || '1gb',
  /*
   * Config specific to the demo only read file api
   */
  storageDemoApiBasePath: process.env.STORAGE_DEMO_API_BASE_PATH || 'nu-storage-demo',
  storageDemoBaseUrl: process.env.STORAGE_DEMO_BASE_URL || `http://localhost:4000`,
  /**
   * Options are 'open', or 'attachment'.  Default is 'open'
   */
  storageDemoDownloadType: process.env.STORAGE_DEMO_DOWNLOAD_TYPE || 'open'
}

app.use(express.raw({type: 'image/*', limit: config.fileSizeLimit}));
app.use(morgan('dev'));

app.listen(config.port, () => {
  console.log(`Network Update Reference Storage Service is running with configuration:`);
  console.log(config);
});

/**
 * GET /nu-storage/v1/status
 * Simple status API to quickly check if your service is up and running.
 *
 * THIS IS FOR DEV PURPOSES ONLY, YOU ARE NOT REQUIRED TO IMPLEMENT THIS API
 */
app.get(`/${config.storageServiceApiBasePath}/v1/status`, (request: Request, response: Response) => {
  response.status(StatusCodes.OK).json({
    name: 'Network Update Reference Storage Service',
    status: 'Running'
  });
});

/**
 * POST /nu-storage/v1/files
 * Query Params:
 *   type=image -- Required
 *   featureId={id} -- Required
 * Accepts: image/*
 *
 * THIS IS THE API YOU ARE REQUIRED TO IMPLEMENT
 */
app.post(`/${config.storageServiceApiBasePath}/v1/files`, async (request: Request, response: Response) => {
  try {

    // 1 - Validate query params

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

    // 2 - Validate the Content-Type

    const contentType = request.header('Content-Type');
    if (contentType === undefined) {
      return response.status(StatusCodes.BAD_REQUEST).json(badRequestError('Content-Type header is required'));
    }

    if (!request.is('image/*')) {
      return response.status(StatusCodes.BAD_REQUEST).json(badRequestError(`Content-Type '${contentType}' not supported.  Supported content types: image/*`))
    }

    // 3 - Validate there is image data

    const rawFile: Buffer = request.body;
    if (rawFile === undefined || !rawFile.length) {
      return response.status(StatusCodes.BAD_REQUEST).json(badRequestError('No file found'));
    }

    // 4 - Generate filename for image

    const fileDirectory = `${__dirname}/${typeQueryParam}`;

    if (!fs.existsSync(fileDirectory)) {
      await fs.promises.mkdir(fileDirectory);
    }

    const filename = `${fileDirectory}/${featureIdQueryParam}-${v1()}.${mime.extension(contentType)}`;

    // 5 - Save image to a location of your choice

    /*
    THIS IS NOT PRODUCTION READY CODE.
    THIS IS A SIMPLE DEMO EXAMPLE WHICH SAVES TO TEMPORARY NON-PERSISTENT CONTAINER STORAGE.
    REPLACE THIS CODE WITH YOUR PRODUCTION READY REQUIREMENTS
     */

    await fs.promises.writeFile(filename, rawFile);
    console.log(`File saved to ${filename}`);

    // 6 - Build url for externally available location where image can be accessed.
    // This is the reference string which will be sent to GSS.

    const fileUrl = `${config.storageDemoBaseUrl}/${config.storageDemoApiBasePath}/v1/files?${querystring.stringify({filePath: filename})}`;

    // 7 - Return url as the 'filePath' in the response

    const responseBody = {filePath: `${fileUrl}`};
    console.log(responseBody);

    response.status(StatusCodes.CREATED).json(responseBody);

  } catch (e) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json(internalServerError(e.message));
  }
});

/**
 * GET /nu-storage-demo/v1/status
 * Simple status API to quickly check if your service is up and running.
 *
 * THIS IS FOR DEMO PURPOSES ONLY, YOU ARE NOT REQUIRED TO IMPLEMENT THIS API
 */
app.get(`/${config.storageDemoApiBasePath}/v1/status`, (request: Request, response: Response) => {
  response.status(StatusCodes.OK).json({
    name: 'Network Update Demo Storage Service for retrieving files',
    status: 'Running'
  });
});

/**
 * GET /nu-storage-demo//v1/files?filePath=<filePath>
 * Query Params:
 *   - filePath: path of file (required)
 *
 * THIS IS FOR DEMO PURPOSES ONLY, YOU ARE NOT REQUIRED TO IMPLEMENT THIS API
 */
app.get(`/${config.storageDemoApiBasePath}/v1/files`, async (request: Request, response: Response) => {

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

  // validate file exists

  if (!fs.existsSync(filePath)) {
    return response.status(StatusCodes.NOT_FOUND).json(notFoundError(`Image with path '${filePath}' does not exist`));
  }

  if (config.storageDemoDownloadType && config.storageDemoDownloadType.toLowerCase() === 'attachment') {
    response.status(StatusCodes.OK).download(filePath);
  } else {
    response.status(StatusCodes.OK).sendFile(filePath);
  }

});

function isString(value): boolean {
  return typeof value === 'string' || value instanceof String;
}

function internalServerError(message: string): ErrorResponseDto {
  return error(StatusCodes.INTERNAL_SERVER_ERROR, message);
}

function badRequestError(message: string): ErrorResponseDto {
  return error(StatusCodes.BAD_REQUEST, message);
}

function notFoundError(message: string): ErrorResponseDto {
  return error(StatusCodes.NOT_FOUND, message);
}

function error(statusCode: number, message: string): ErrorResponseDto {
  return {
    statusCode,
    errors: [message]
  }
}

export default app;

