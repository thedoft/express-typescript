import * as typeorm from 'typeorm';
import TokenData from '../interfaces/tokenData.interface';
import AuthenticationService from './authentication.service';

(typeorm as any).getRepository = jest.fn();

describe('The AuthenticationService', () => {
  describe('when creating a cookie', () => {
    it('should return a string', () => {
      const tokenData: TokenData = {
        token: '',
        expiresIn: 1,
      };
      (typeorm as any).getRepository.mockReturnValue({});
      const authenticationService = new AuthenticationService();
      expect(typeof authenticationService.createCookie(tokenData))
        .toEqual('string');
    });
  });
});
