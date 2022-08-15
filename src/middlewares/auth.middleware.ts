import { NextFunction, RequestHandler, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import User from '../users/user.entity';
import AuthenticationTokenMissingException from '../exceptions/AuthenticationTokenMissingException';
import WrongAuthenticationTokenException from '../exceptions/WrongAuthenticationTokenException';
import DataStoredInToken from '../interfaces/dataStoredInToken.interface';
import RequestWithUser from '../interfaces/requestWithUser.interface';

function authMiddleware(omitSecondFactor = false): RequestHandler {
  return async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const cookies = request.cookies;
    const userRepository = getRepository(User);

    if (cookies && cookies.Authorization) {
      const secret = process.env.JWT_SECRET;

      try {
        const verificationResponse = jwt.verify(cookies.Authorization, secret) as DataStoredInToken;
        const { id, isSecondFactorAuthenticated } = verificationResponse;
        const user = await userRepository.findOne(id);

        if (user) {
          if (!omitSecondFactor && user.isTwoFactorAuthenticationEnabled && !isSecondFactorAuthenticated) {
            next(new WrongAuthenticationTokenException());
          } else {
            request.user = user;
            next();
          }
        } else {
          next(new WrongAuthenticationTokenException());
        }
      } catch (error) {
        next(new WrongAuthenticationTokenException());
      }
    } else {
      next(new AuthenticationTokenMissingException());
    }
  }
}

export default authMiddleware;
