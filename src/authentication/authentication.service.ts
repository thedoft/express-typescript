import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import CreateUserDto from '../users/user.dto';
import LoginDto from './login.dto';
import UserWithThatEmailAlreadyExistsException from '../exceptions/UserWithThatEmailAlreadyExistsException';
import WrongCredentialsException from '../exceptions/WrongCredentialsException';
import TokenData from 'interfaces/TokenData.interface';
import DataStoredInToken from 'interfaces/dataStoredInToken.interface';
import { getRepository } from 'typeorm';
import User from '../users/user.entity';
import { Response } from 'express';
import IUser from 'users/user.interface';

class AuthenticationService {
  private userRepository = getRepository(User);

  public createToken(user: IUser, isSecondFactorAuthenticated = false): TokenData {
    const expiresIn = 60 * 60; // an hour
    const secret = process.env.JWT_SECRET;
    const dataStoredInToken: DataStoredInToken = {
      isSecondFactorAuthenticated,
      id: user.id,
    };

    return {
      expiresIn,
      token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
    };
  }

  public register = async (userData: CreateUserDto) => {
    const { email, password } = userData;

    if (
      await this.userRepository.findOne({ email })
    ) {
      throw new UserWithThatEmailAlreadyExistsException(email);
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await this.userRepository.create({
        ...userData,
        password: hashedPassword,
      });
      await this.userRepository.save(user);

      user.password = undefined;
      const tokenData = this.createToken(user);
      const cookie = this.createCookie(tokenData)

      return { user, cookie };
    }
  }

  public login = async (loginData: LoginDto) => {
    const { email, password } = loginData;
    const user = await this.userRepository.findOne({ email });

    if (user) {
      const isPasswordMatching = await bcrypt.compare(password, user.password);
      if (isPasswordMatching) {
        const tokenData = this.createToken(user);
        const cookie = this.createCookie(tokenData);
        user.password = undefined;
        user.twoFactorAuthenticationCode = undefined;

        return { user, cookie };
      } else {
        throw new WrongCredentialsException();
      }
    } else {
      throw new WrongCredentialsException();
    }
  }

  public logout = () => {
    return this.createCookie({ token: '', expiresIn: 0 });
  }

  public createCookie({ token, expiresIn }: TokenData) {
    return `Authorization=${token}; HttpOnly; Path=/; Max-Age=${expiresIn}`;
  }

  public getTwoFactorAuthenticationCode() {
    const secretCode = speakeasy.generateSecret({
      name: process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME,
    });
    return {
      otpauthUrl : secretCode.otpauth_url,
      base32: secretCode.base32,
    };
  }

  public respondWithQRCode(data: string, response: Response) {
    QRCode.toFileStream(response, data);
  }

  public verifyTwoFactorAuthenticationCode(twoFactorAuthenticationCode: string, user: IUser) {
    return speakeasy.totp.verify({
      secret: user.twoFactorAuthenticationCode,
      encoding: 'base32',
      token: twoFactorAuthenticationCode,
    });
  }
}

export default AuthenticationService;
