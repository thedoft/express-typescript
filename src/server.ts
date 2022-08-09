import AuthenticationController from './authentication/authentication.controller';
import App from './app';
import PostsController from './posts/posts.controller';
import validateEnv from './utils/validateEnv';
import UsersController from './users/user.controller';
import ReportController from './report/report.controller';

validateEnv()

const app = new App(
  [
    new AuthenticationController(),
    new UsersController(),
    new PostsController(),
    new ReportController(),
  ],
);

app.listen();
