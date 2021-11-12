import {expect} from 'chai';
import {agent as request} from 'supertest';
import app from './app';
import {StatusCodes} from 'http-status-codes';
import fs from 'fs';

describe('Storage service API tests', () => {

  const baseUrl = '/nu-storage';

  describe('Status API', () => {
    it('should be able to return the API status', async () => {
      const response = await request(app).get(`${baseUrl}/v1/status`);
      expect(response.status).to.equal(StatusCodes.OK);
    });
  });

  describe('POST file API', () => {
    const badRequestQueryParams = [
      {
        query: undefined,
        testMessage: 'query is undefined',
      },
      {
        query: {
          type: ''
        },
        testMessage: 'type query param is empty',
      },
      {
        query: {
          type: 'notImage',
        },
        testMessage: 'type query param is not "image"'
      },
      {
        query: {
          type: 'image',
          featureId: '',
        },
        testMessage: 'featureId query param is empty'
      }
    ]

    badRequestQueryParams.forEach((queryObj) => {
      it(`should return a Bad Request Error if ${queryObj.testMessage}`, async () => {
        const response = await request(app).post(`${baseUrl}/v1/files`).query(queryObj.query);
        expect(response.status).to.equal(StatusCodes.BAD_REQUEST);
      });
    });

    it('should return a Bad Request Error if the Content-Type unset', async () => {
      const buff = Buffer.alloc(10)
      const response = await request(app).post(`${baseUrl}/v1/files`).query({
        type: 'image',
        featureId: 'an-id'
      }).send(buff).unset('Content-Type');
      expect(response.status).to.equal(StatusCodes.BAD_REQUEST);
      expect(response.body.errors[0]).to.equal('Content-Type header is required');
    });

    it('should return a Bad Request Error if the Content-Type is not image/*', async () => {
      const buff = Buffer.alloc(10);
      const response = await request(app).post(`${baseUrl}/v1/files`).query({
        type: 'image',
        featureId: 'an-id'
      }).send(buff).set('Content-Type', 'application/json');
      expect(response.status).to.equal(StatusCodes.BAD_REQUEST);
      expect(response.body.errors[0]).to.equal('Content-Type \'application/json\' not supported.  Supported content types: image/*');
    });

    it('should return a Bad Request Error if file data not attached', async () => {
      const response = await request(app).post(`${baseUrl}/v1/files`).query({
        type: 'image',
        featureId: 'an-id'
      }).set('Content-Type', 'image/png');
      expect(response.status).to.equal(StatusCodes.BAD_REQUEST);
      expect(response.body.errors[0]).to.equal('No file found');
    });

    it('should successfully save image file and return Created', async () => {
      const filePath = `${__dirname}/test-files/test-file.png`;
      const fileBuffer = await fs.readFileSync(filePath);

      const response = await request(app).post(`${baseUrl}/v1/files`).query({
        type: 'image',
        featureId: 'an-id'
      }).send(fileBuffer).set('Content-Type', 'image/png');
      expect(response.status).to.equal(StatusCodes.CREATED);
      expect(response.body.filePath).is.not.null;
    });

  });
});
