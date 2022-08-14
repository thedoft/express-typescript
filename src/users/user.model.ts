import * as mongoose from 'mongoose';
import IUser from './user.interface';

const addressSchema = new mongoose.Schema({
  country: String,
  city: String,
  street: String,
});

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  address: addressSchema,
});

const userModel = mongoose.model<IUser & mongoose.Document>('User', userSchema);

export default userModel;
