import express, {Application, Request, Response} from 'express';
import {v1} from 'uuid';
import fs from 'fs';
import {ErrorResponseDto} from './error-response.dto';
import {StatusCodes} from 'http-status-codes';
import mime from 'mime';

const app: Application = express();

const port = process.env.PORT || 4000;

app.use(express.raw({type: 'image/*', limit: '1gb'}));

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});

/**
 * GET /v1/status
 * Simple status API to quickly check if your service is up and running.
 */
app.get('/v1/status', (request: Request, response: Response) => {
  response.status(StatusCodes.OK).json({
    name: 'Network Update Reference Storage Service',
    status: 'Running'
  });
});

/**
 * POST /v1/files
 * Query Params:
 *   type=image -- Required
 *   featureId={id} -- Required
 * Accepts: image/*
 */
app.post('/v1/files', async (request: Request, response: Response) => {

  try {

    // Validate query params

    const queryParams = request.query;

    if (queryParams === undefined) {
      return response.status(StatusCodes.BAD_REQUEST).json(badRequestError('Required query params: type, featureId'));
    }

    const typeQueryParam = queryParams.type;
    if (!isString(typeQueryParam) || (typeQueryParam as string).trim() === '') {
      return response.status(StatusCodes.BAD_REQUEST).json(badRequestError('type is required query param'));
    }

    if ((typeQueryParam as string).trim().toLowerCase() !== 'image') {
      return response.status(StatusCodes.BAD_REQUEST).json(badRequestError(`Supported values for 'type': image`));
    }

    const featureIdQueryParam = queryParams.featureId;
    if (!isString(featureIdQueryParam) || (featureIdQueryParam as string).trim() === '') {
      return response.status(StatusCodes.BAD_REQUEST).json(badRequestError('featureId is required query param'));
    }

    // Validate there is image data

    const rawFile: Buffer = request.body;
    if (rawFile === undefined || rawFile.length === 0) {
      return response.status(StatusCodes.BAD_REQUEST).json(badRequestError('No file found'));
    }
    console.log({rawFile});

    // Validate the Content-Type

    const contentType = request.header('Content-Type');
    console.log({contentType});
    if (contentType === undefined) {
      return response.status(StatusCodes.BAD_REQUEST).json(badRequestError('Content-Type header is required'));
    }

    if (!request.is('image/*')) {
      return response.status(StatusCodes.BAD_REQUEST).json(badRequestError(`Content-Type '${contentType}' not supported.  Supported content types: image/*`))
    }

    // Generate filename

    const filename = `${__dirname}\${typeQueryParam}-${featureIdQueryParam}-${v1()}.${mime.extension(contentType)}`;

    // Write image to file

    let debugInfo = {
      dirName: __dirname,
      cwd: process.cwd(),
    }

    console.log(debugInfo);

    await fs.promises.writeFile(filename, rawFile);
    console.log(`File saved to ${filename}`);

    // Return url as response

    response.json({
      filePath: `${filename}`
    });

  } catch (e) {
    response.status(StatusCodes.INTERNAL_SERVER_ERROR).json(internalServerError(e.message));
  }
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

