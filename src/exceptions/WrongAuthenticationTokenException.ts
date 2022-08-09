import HttpException from "./HttpException";

class WrongAuthenticationTokenException extends HttpException {
  constructor() {
    super(401, 'Wrong auth token');
  }
}

export default WrongAuthenticationTokenException;
