import { TypeKoa } from 'type-koa';
import { ActionController } from "./controllers/ActionController";

let port: number = process.env.PORT ? +process.env.PORT : 80;
let host: string = process.env.HTTP_HOST || '';

let typeKoa = new TypeKoa();

typeKoa.bootstrapControllers({
  controllerList: [ActionController],
  middlewareList: []
});

let httpServer = typeKoa.koa.listen(port, host);
const app = typeKoa.koa.callback();

console.log(`Server started at: http://${host}:${port}`);
export { app, typeKoa, httpServer }