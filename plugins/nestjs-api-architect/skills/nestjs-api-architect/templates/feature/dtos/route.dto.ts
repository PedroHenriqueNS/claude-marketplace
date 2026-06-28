// Api<Route>Doc — the route's ENTIRE Swagger contract in one applyDecorators-composed helper.
// In your project, name this file per-route under application/dtos/ — e.g.
// src/modules/<feature>/application/dtos/create-<feature>.dto.ts (or src/shared/api-docs/dtos/
// for cross-cutting helpers). (The template library uses the generic name `route.dto.ts`.)
//
// Swagger-ONLY decorators go inside. Runtime decorators (@HttpCode, @UseGuards, @SkipApiKey,
// @PublicRoute, @Idempotent) stay on the controller method so the auth/response contract is visible
// at the call site — a guard hidden inside a "doc" helper silently changes behavior.
//
// Typed shorthand responses (ApiCreatedResponse, ApiOkResponse, ApiNoContentResponse, ...) infer
// their status from the decorator name — do NOT pass `status:` to them.
import { applyDecorators } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { Create<Feature>RequestDto } from "./request.dto";
import { <UseCase>Output } from "../../domain/<use-case>/output";

export const ApiCreate<Feature>Doc = (): MethodDecorator =>
  applyDecorators(
    ApiTags("<feature>"),
    ApiOperation({ summary: "Create a <feature>." }),
    ApiBody({ type: Create<Feature>RequestDto }),
    ApiCreatedResponse({ description: "Created.", type: <UseCase>Output }),
    ApiBadRequestResponse({ description: "Validation failed." }),
  );
