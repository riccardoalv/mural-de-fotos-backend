import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { z } from 'zod';
import { ZodResponseInterceptor } from '../interceptors/zod-response.interceptor';

export function TransformResponse(schema: z.ZodType<any>) {
  return applyDecorators(UseInterceptors(new ZodResponseInterceptor(schema)));
}
