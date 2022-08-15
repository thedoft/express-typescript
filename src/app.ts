import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as mongoose from 'mongoose';
import 'dotenv/config';
import Controller from 'interfaces/controller.interface';
import errorMiddleware from './middlewares/error.middleware';

const {
  PORT,
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_PATH,
} = process.env;

class App {
  public app: express.Application;

  constructor(controllers: Controller[]) {
    this.app = express();

    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.initializeErrorHandling()
  }

  private initializeMiddlewares() {
    this.app.use(cookieParser());
    this.app.use(bodyParser.json());
  }

  private initializeControllers(controllers: Controller[]) {
    controllers.forEach((controller: Controller) => {
      this.app.use('/', controller.router);
    });
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  public listen() {
    this.app.listen(PORT, () => {
      console.log(`App listening on the port ${PORT}`);
    });
  }

  public getServer() {
    return this.app;
  }
}

export default App;
