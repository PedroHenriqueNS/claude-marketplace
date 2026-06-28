// Send<Thing>Module — the per-operation gateway module. Provides + exports the gateway and wires
// the HTTP client it needs. NOT @Global. A <system>-gateway.module.ts group module re-exports it.
// Lives at src/shared/gateways/<system>-gateway/send-<thing>/send-<thing>.module.ts.
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { Send<Thing>Gateway } from "./index.gateway";

@Module({
  imports: [HttpModule],
  providers: [Send<Thing>Gateway],
  exports: [Send<Thing>Gateway],
})
export class Send<Thing>Module {}
