import { Router, Response, NextFunction } from 'express';
import NotAuthorizedException from '../exceptions/NotAuthorizedException';
import Controller from '../interfaces/controller.interface';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import authMiddleware from '../middlewares/auth.middleware';
import postModel from '../posts/post.model';

class UsersController implements Controller {
  public path = '/users';
  public router = Router();
  private post = postModel;

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:id/posts`, authMiddleware, this.getAllPostsOfUser);
  }

  private getAllPostsOfUser = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const { params, user } = request;
    const { id: userId } = params;

    if (userId === user._id.toString()) {
      const posts = await this.post.find({ author: userId });
      return response.send(posts);
    }
    next(new NotAuthorizedException());
  }
}

export default UsersController;
