import NotFoundException from '../exceptions/NotFoundException';
import { Router, Request, Response, NextFunction } from 'express';
import Controller from 'interfaces/controller.interface';
import IPost from './post.interface';
import validationMiddleware from '../middlewares/validation.middleware';
import CreatePostDto from './post.dto';
import authMiddleware from '../middlewares/auth.middleware';
import RequestWithUser from 'interfaces/requestWithUser.interface';
import { getRepository } from 'typeorm';
import Post from './post.entity';

class PostsController implements Controller {
  public path = '/posts';
  public router = Router();
  private postRepository = getRepository(Post);

  constructor() {
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.path, this.getAllPosts);
    this.router.get(`${this.path}/:id`, this.getPostById);
    this.router
      .all(`${this.path}/*`, authMiddleware)
      .post(this.path, authMiddleware, validationMiddleware(CreatePostDto), this.createPost)
      .patch(`${this.path}/:id`, validationMiddleware(CreatePostDto, true), this.modifyPost)
      .delete(`${this.path}/:id`, this.deletePost);
  }

  private getAllPosts = async (request: Request, response: Response) => {
    const posts = await this.postRepository.find({ relations: ['categories'] });

    response.send(posts);
  }

  private createPost = async (request: RequestWithUser, response: Response) => {
    const postData: IPost = request.body;

    const createdPost = this.postRepository.create({
      ...postData,
      author: request.user,
    });
    const savedPost = await this.postRepository.save(createdPost);

    response.send(savedPost);
  }

  private getPostById = async (request: Request, response: Response, next: NextFunction) => {
    const id = request.params.id;

    const post = await this.postRepository.findOne(id, { relations: ['categories'] });

    if (post) {
      response.send(post);
    } else {
      next(new NotFoundException(Post.name, id));
    }
  }

  private modifyPost = async (request: Request, response: Response, next: NextFunction) => {
    const postData: IPost = request.body;
    const { id } = request.params;

    await this.postRepository.update(id, postData);
    const updatedPost = await this.postRepository.findOne(id);


    if (updatedPost) {
      response.send(updatedPost);
    } else {
      next(new NotFoundException(Post.name, id));
    }
  }

  private deletePost = async (request: Request, response: Response, next: NextFunction) => {
    const { id } = request.params;

    const deleteResponse = await this.postRepository.delete(id);

    if (deleteResponse.raw[1]) {
      response.sendStatus(200);
    } else {
      next(new NotFoundException(Post.name, id));
    }
  }
}

export default PostsController;
