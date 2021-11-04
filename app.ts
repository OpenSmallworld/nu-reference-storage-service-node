import express, { Application, Request, Response } from 'express'

const app: Application = express();

const port = process.env.PORT || 4001;

app.use(express.json());

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});

app.get('v1/status', (request: Request, response: Response) => {
  response.status(200).json({
    status: 'Running'
  });
});
