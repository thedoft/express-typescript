import { Router, Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import NotFoundException from '../exceptions/NotFoundException';
import Controller from '../interfaces/controller.interface';
import validationMiddleware from '../middlewares/validation.middleware';
import CreateCategoryDto from './category.dto';
import Category from './category.entity';

class CategoryController implements Controller {
  public path = '/categories';
  public router = Router();
  private categoryRepository = getRepository(Category);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, this.getAllCategories);
    this.router.get(`${this.path}/:id`, this.getCategoryById);
    this.router.post(this.path, validationMiddleware(CreateCategoryDto), this.createCategory);
  }

  private getAllCategories = async (request: Request, response: Response) => {
    const categories = await this.categoryRepository.find({ relations: ['posts'] });
    response.send(categories);
  }

  private getCategoryById = async (request: Request, response: Response, next: NextFunction) => {
    const id = request.params.id;
    const category = await this.categoryRepository.findOne(id, { relations: ['posts'] });
    if (category) {
      response.send(category);
    } else {
      next(new NotFoundException(Category.name, id));
    }
  }

  private createCategory = async (request: Request, response: Response) => {
    const categoryData: CreateCategoryDto = request.body;
    const newCategory = this.categoryRepository.create(categoryData);
    await this.categoryRepository.save(newCategory);
    response.send(newCategory);
  }
}

export default CategoryController;
