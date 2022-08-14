import { Request } from 'express';
import IUser from 'users/user.interface';

interface RequestWithUser extends Request {
  user: IUser;
}

export default RequestWithUser;
