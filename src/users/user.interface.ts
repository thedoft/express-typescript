interface IUser {
  id?: string;
  fullName: string;
  email: string;
  password: string;
  twoFactorAuthenticationCode?: string;
}

export default IUser;
