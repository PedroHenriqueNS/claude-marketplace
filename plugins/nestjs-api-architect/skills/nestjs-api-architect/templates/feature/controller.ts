// <Feature>Controller — the APPLICATION layer (HTTP delivery). Lives at
// src/modules/<feature>/application/<feature>.controller.ts.
//
// Each method does exactly three things: map the route, pull request data, call the use case and
// return its output. No mapping, no casts, no branching — those belong in the service.
// Runtime decorators (@HttpCode, guards) stay visible here; Swagger lives in the Api<Route>Doc helper.
import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { BaseController } from "@/shared/base/base-controller";
import { CurrentUser } from "@/@core/decorators/decorators";
import { AuthenticatedUser } from "@/@core/auth/authenticated-user.type";
import { <UseCase>Service } from "../domain/<use-case>/index.service";
import { <UseCase>Input } from "../domain/<use-case>/input";
import { <UseCase>Output } from "../domain/<use-case>/output";
import { Create<Feature>RequestDto } from "./dtos/request.dto";
import { ApiCreate<Feature>Doc } from "./dtos/route.dto";

@Controller("v1/<feature>") // prefix = the owning module — never serve another module's routes here
export class <Feature>Controller extends BaseController {
  constructor(private readonly <useCase>: <UseCase>Service) {
    super();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreate<Feature>Doc()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: Create<Feature>RequestDto,
  ): Promise<<UseCase>Output> {
    // viewerId comes from the verified identity, not the wire body.
    return this.<useCase>.execute(<UseCase>Input.of({ message: body.message, viewerId: user.id }));
  }
}
