import AuthenticationController from './authentication/authentication.controller';
import App from './app';
import PostsController from './posts/posts.controller';
import validateEnv from './utils/validateEnv';
import UsersController from './users/user.controller';
import ReportController from './report/report.controller';
import { createConnection } from 'typeorm';
import config from './ormconfig';
import CategoryController from './category/category.controller';

validateEnv();

(async () => {
  try {
    const connection = await createConnection(config);
    await connection.runMigrations();
  } catch (error) {
    console.error('Error while connecting to the database', error);
    return error;
  }
  const app = new App(
    [
      new AuthenticationController(),
      new UsersController(),
      new PostsController(),
      new ReportController(),
      new CategoryController(),
    ],
  );

  app.listen();
})();
