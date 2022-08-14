import IUser from "users/user.interface";

interface IPost {
  author: IUser;
  content: string;
  title: string;
}

export default IPost;
