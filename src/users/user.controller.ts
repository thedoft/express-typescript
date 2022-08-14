import Address from '../address/address.entity';
import { Router, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import NotAuthorizedException from '../exceptions/NotAuthorizedException';
import Controller from '../interfaces/controller.interface';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import authMiddleware from '../middlewares/auth.middleware';
import User from './user.entity';

class UsersController implements Controller {
  public path = '/users';
  public router = Router();
  private userRepository = getRepository(User);
  private addressRepository = getRepository(Address)

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:id/posts`, authMiddleware, this.getAllPostsOfUser);
    this.router.get(`${this.path}/address`, authMiddleware, this.getAllAddresses);
  }

  private getAllPostsOfUser = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const { params, user } = request;
    const { id: userId } = params;

    if (userId === user.id.toString()) {
      const posts = await this.userRepository.find({});
      return response.send(posts);
    }
    next(new NotAuthorizedException());
  }

  private getAllAddresses = async (request: RequestWithUser, response: Response) => {
    const addresses = await this.addressRepository.find({ relations: ['user'] });
    response.send(addresses);
  }
}

export default UsersController;
