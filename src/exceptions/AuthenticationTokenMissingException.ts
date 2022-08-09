import HttpException from "./HttpException";

class AuthenticationTokenMissingException extends HttpException {
  constructor() {
    super(401, 'Auth token missing');
  }
}

export default AuthenticationTokenMissingException;
