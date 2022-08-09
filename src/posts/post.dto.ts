import { IsString } from 'class-validator';
import Post from './post.interface';

class CreatePostDto {
  @IsString()
  public content: string;

  @IsString()
  public title: string;
}

export default CreatePostDto;
