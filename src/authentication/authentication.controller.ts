import Controller from 'interfaces/controller.interface';
import { Router, Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import validationMiddleware from '../middlewares/validation.middleware';
import CreateUserDto from '../users/user.dto';
import LoginDto from './login.dto';
import UserWithThatEmailAlreadyExistsException from '../exceptions/UserWithThatEmailAlreadyExistsException';
import WrongCredentialsException from '../exceptions/WrongCredentialsException';
import TokenData from 'interfaces/TokenData.interface';
import DataStoredInToken from 'interfaces/dataStoredInToken.interface';
import authMiddleware from '../middlewares/auth.middleware';
import { getRepository } from 'typeorm';
import User from '../users/user.entity';
import AuthenticationService from './authentication.service';

class AuthenticationController implements Controller {
  public path = '/auth';
  public router = Router();
  private authenticationService = new AuthenticationService();

  constructor() {
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.post(`${this.path}/register`, validationMiddleware(CreateUserDto), this.register);
    this.router.post(`${this.path}/login`, validationMiddleware(LoginDto), this.login);
    this.router.post(`${this.path}/logout`, authMiddleware, this.logout);
  }

  private createToken(user: User): TokenData {
    const expiresIn = 60 * 60; // an hour
    const secret = process.env.JWT_SECRET;
    const dataStoredInToken: DataStoredInToken = {
      id: user.id,
    };

    return {
      expiresIn,
      token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
    };
  }

  private register = async (request: Request, response: Response, next: NextFunction) => {
    const userData: CreateUserDto = request.body;

    try {
      const { user, cookie } = await this.authenticationService.register(userData);

      response.setHeader('Set-Cookie', [cookie]);
      response.send(user);
    } catch (error: any) {
      next(error);
    }
  }

  private login = async (request: Request, response: Response, next: NextFunction) => {
    const loginData: LoginDto = request.body;

    try {
      const { user, cookie } = await this.authenticationService.login(loginData);
      response.setHeader('Set-Cookie', [cookie]);
      response.send(user);
    } catch (error) {
      next(error);
    }
  }

  private logout = (request: Request, response: Response) => {
    const cookie = this.authenticationService.logout();
    response.setHeader('Set-Cookie', [cookie]);
    response.sendStatus(200);
  }
}

export default AuthenticationController;
