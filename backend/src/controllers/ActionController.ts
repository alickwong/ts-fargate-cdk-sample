import {Context} from "koa";
import {Controller, Get} from "type-koa";

@Controller('')
export class ActionController {
  @Get('/')
  async getRoute(ctx: Context) {
    ctx.body = 'Hello World!! 444';
  }
}
