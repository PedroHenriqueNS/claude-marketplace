// Send<Thing>Gateway — ONE call to an external system, the ANTI-CORRUPTION LAYER. Lives at
// src/shared/gateways/<system>-gateway/send-<thing>/index.gateway.ts.
//
// This class is the only code that knows the external system's API (HTTP shapes, SDK, auth). It
// translates between the domain's vocabulary (its Input/Output) and the foreign system's, so the
// rest of the app never depends on the external contract. On failure it throws a domain exception
// whose message NEVER names the external system (logs may name it freely).
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { EnvService } from "@/@core/config/env.service";
import { BaseException } from "@/@core/exceptions/base.exception";
import { HttpStatus } from "@nestjs/common";
import { Send<Thing>Input } from "./input";
import { Send<Thing>Output } from "./output";

@Injectable()
export class Send<Thing>Gateway {
  constructor(
    private readonly http: HttpService,
    private readonly env: EnvService,
  ) {}

  async execute(input: Send<Thing>Input): Promise<Send<Thing>Output> {
    try {
      const res = await firstValueFrom(
        this.http.post(`${this.env.get("<SYSTEM>_BASE_URL")}/things`, { to: input.to, body: input.body }),
      );
      return Send<Thing>Output.of({ externalId: res.data.id });
    } catch (cause) {
      // Generic message — never leak the upstream's name to the client. Log `cause` for ops.
      throw BaseException.of({
        code: "<SYSTEM>.UNAVAILABLE",
        message: "The upstream service is currently unavailable.",
        status: HttpStatus.BAD_GATEWAY,
        cause,
      });
    }
  }
}
