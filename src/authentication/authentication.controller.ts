import Controller from '../interfaces/controller.interface';
import { Router, Request, Response, NextFunction } from 'express';
import validationMiddleware from '../middlewares/validation.middleware';
import CreateUserDto from '../users/user.dto';
import LoginDto from './login.dto';
import authMiddleware from '../middlewares/auth.middleware';
import { getRepository } from 'typeorm';
import User from '../users/user.entity';
import AuthenticationService from './authentication.service';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import WrongAuthenticationTokenException from '../exceptions/WrongAuthenticationTokenException';
import { TwoFactorAuthenticationDto } from './twoFactorAuthentication.dto';

class AuthenticationController implements Controller {
  public path = '/auth';
  public router = Router();
  private authenticationService = new AuthenticationService();
  private userRepository = getRepository(User);

  constructor() {
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.post(`${this.path}/register`, validationMiddleware(CreateUserDto), this.register);
    this.router.post(`${this.path}/login`, validationMiddleware(LoginDto), this.login);
    this.router.post(`${this.path}/logout`, authMiddleware, this.logout);
    this.router.get(`${this.path}/2fa/generate`, authMiddleware, this.generateTwoFactorAuthenticationCode);
    this.router.post(
      `${this.path}/2fa/turn-on`,
      validationMiddleware(TwoFactorAuthenticationDto),
      authMiddleware,
      this.turnOnTwoFactorAuthentication,
    );
    this.router.post(
      `${this.path}/2fa/authenticate`,
      validationMiddleware(TwoFactorAuthenticationDto),
      authMiddleware(true),
      this.secondFactorAuthentication,
    );
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

      if (user.isTwoFactorAuthenticationEnabled) {
        response.send({
          isTwoFactorAuthenticationEnabled: true,
        });
      } else {
        response.send(user);
      }
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

  private generateTwoFactorAuthenticationCode = async (
    request: RequestWithUser,
    response: Response,
  ) => {
    const user = request.user;
    const {
      otpauthUrl,
      base32,
    } = this.authenticationService.getTwoFactorAuthenticationCode();
    await this.userRepository.update(user.id, {
      twoFactorAuthenticationCode: base32,
    });
    this.authenticationService.respondWithQRCode(otpauthUrl, response);
  }

  private turnOnTwoFactorAuthentication = async (
    request: RequestWithUser,
    response: Response,
    next: NextFunction,
  ) => {
    const { twoFactorAuthenticationCode } = request.body;
    const user = request.user;
    const isCodeValid = await this.authenticationService.verifyTwoFactorAuthenticationCode(
      twoFactorAuthenticationCode, user,
    );
    if (isCodeValid) {
      await this.userRepository.update(user.id, {
        isTwoFactorAuthenticationEnabled: true,
      });
      response.sendStatus(200);
    } else {
      next(new WrongAuthenticationTokenException());
    }
  }

  private secondFactorAuthentication = async (
    request: RequestWithUser,
    response: Response,
    next: NextFunction,
  ) => {
    const { twoFactorAuthenticationCode } = request.body;
    const user = request.user;
    const isCodeValid = await this.authenticationService.verifyTwoFactorAuthenticationCode(
      twoFactorAuthenticationCode, user,
    );
    if (isCodeValid) {
      const tokenData = this.authenticationService.createToken(user, true);
      response.setHeader('Set-Cookie', [this.authenticationService.createCookie(tokenData)]);
      response.send({
        ...user,
        password: undefined,
        twoFactorAuthenticationCode: undefined
      });
    } else {
      next(new WrongAuthenticationTokenException());
    }
  }
}

export default AuthenticationController;
