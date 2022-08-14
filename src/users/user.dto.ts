import { IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import CreateAddressDto from '../address/address.dto';

class CreateUserDto {
  @IsString()
  public fullName: string;

  @IsString()
  public email: string;

  @IsString()
  public password: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  public address?: CreateAddressDto;
}

export default CreateUserDto;
