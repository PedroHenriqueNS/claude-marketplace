// Create<Feature>RequestDto — the HTTP request BODY shape. In your project, name it per-route under
// application/dtos/ — e.g. create-<feature>.request.dto.ts. (Generic `request.dto.ts` in the library.)
//
// Request DTOs stay (unlike response DTOs, which are deleted in favour of the service Output): the
// wire body and the service Input often differ — the controller adds auth-injected fields like
// viewerId via `<UseCase>Input.of({ ...body, viewerId: user.id })`. class-validator decodes/validates
// the wire payload; @ApiProperty documents it.
import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class Create<Feature>RequestDto {
  @ApiProperty({ description: "What the caller sends.", example: "hello" })
  @IsString()
  @MinLength(1)
  message!: string;
}
