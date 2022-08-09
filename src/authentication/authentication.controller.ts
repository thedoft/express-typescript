import Controller from 'interfaces/controller.interface';
import { Router, Request, Response, NextFunction } from 'express';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import userModel from '../users/user.model';
import validationMiddleware from '../middlewares/validation.middleware';
import CreateUserDto from '../users/user.dto';
import LoginDto from './login.dto';
import UserWithThatEmailAlreadyExistsException from '../exceptions/UserWithThatEmailAlreadyExistsException';
import WrongCredentialsException from '../exceptions/WrongCredentialsException';
import User from 'users/user.interface';
import TokenData from 'interfaces/TokenData.interface';
import DataStoredInToken from 'interfaces/dataStoredInToken.interface';
import authMiddleware from '../middlewares/auth.middleware';

class AuthenticationController implements Controller {
  public path = '/auth';
  public router = Router();
  private user = userModel;

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
      _id: user._id,
    };

    return {
      expiresIn,
      token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
    };
  }

  private register = async (request: Request, response: Response, next: NextFunction) => {
    const userData: CreateUserDto = request.body;
    const { email, password } = userData;

    if (
      await this.user.findOne({ email })
    ) {
      next(new UserWithThatEmailAlreadyExistsException(email));
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await this.user.create({
        ...userData,
        password: hashedPassword,
      });

      user.password = undefined;
      const tokenData = this.createToken(user);

      response.setHeader('Set-Cookie', [this.createCookie(tokenData)]);
      response.send(user);
    }
  }

  private login = async (request: Request, response: Response, next: NextFunction) => {
    const loginData: LoginDto = request.body;
    const { email, password } = loginData;
    const user = await this.user.findOne({ email });

    if (user) {
      const isPasswordMatching = await bcrypt.compare(password, user.password);
      if (isPasswordMatching) {
        const tokenData = this.createToken(user);
        response.setHeader('Set-Cookie', [this.createCookie(tokenData)]);

        user.password = undefined;
        response.send(user);
      } else {
        next(new WrongCredentialsException());
      }
    } else {
      next(new WrongCredentialsException());
    }
  }

  private logout = (request: Request, response: Response) => {
    response.setHeader('Set-Cookie', [this.createCookie({ token: '', expiresIn: 0 })]);
    response.sendStatus(200);
  }

  private createCookie({ token, expiresIn }: TokenData) {
    return `Authorization=${token}; HttpOnly; Path=/; Max-Age=${expiresIn}`;
  }
}

export default AuthenticationController;
