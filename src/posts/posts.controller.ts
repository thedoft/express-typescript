import NotFoundException from '../exceptions/NotFoundException';
import { Router, Request, Response, NextFunction } from 'express';
import Controller from 'interfaces/controller.interface';
import Post from './post.interface';
import postModel from './post.model';
import validationMiddleware from '../middlewares/validation.middleware';
import CreatePostDto from './post.dto';
import authMiddleware from '../middlewares/auth.middleware';
import RequestWithUser from 'interfaces/requestWithUser.interface';

class PostsController implements Controller {
  public path = '/posts';
  public router = Router();
  private post = postModel;
  private modelName = postModel.modelName;

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
    const posts = await this.post.find().populate('author', '-password');

    response.send(posts);
  }

  private createPost = async (request: RequestWithUser, response: Response) => {
    const postData: Post = request.body;

    const createdPost = new this.post({
      ...postData,
      author: request.user._id,
    });
    const savedPost = await createdPost.save();
    await savedPost.populate('author', '-password');

    response.send(savedPost);
  }

  private getPostById = async (request: Request, response: Response, next: NextFunction) => {
    const id = request.params.id;

    const post = await this.post.findById(id);

    if (post) {
      response.send(post);
    } else {
      next(new NotFoundException(this.modelName, id));
    }
  }

  private modifyPost = async (request: Request, response: Response, next: NextFunction) => {
    const postData: Post = request.body;
    const { id } = request.params;

    const updatedPost = await this.post.findByIdAndUpdate(id, postData, { new: true });

    if (updatedPost) {
      response.send(updatedPost);
    } else {
      next(new NotFoundException(this.modelName, id));
    }
  }

  private deletePost = async (request: Request, response: Response, next: NextFunction) => {
    const { id } = request.params;

    const deletedPost = await this.post.findByIdAndDelete(id);

    if (deletedPost) {
      response.send(deletedPost);
    } else {
      next(new NotFoundException(this.modelName, id));
    }
  }
}

export default PostsController;
