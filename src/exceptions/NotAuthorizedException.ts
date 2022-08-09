import HttpException from "./HttpException";

class NotAuthorizedException extends HttpException {
  constructor() {
    super(403, 'Not authorized');
  }
}

export default NotAuthorizedException;
