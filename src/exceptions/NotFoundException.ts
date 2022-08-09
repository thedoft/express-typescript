import HttpException from "./HttpException";

class NotFoundException extends HttpException {
  constructor(model: string, id: string) {
    super(404, `${model} with id ${id} not found`);
  }
}

export default NotFoundException;
