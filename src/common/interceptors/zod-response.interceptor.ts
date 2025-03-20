import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { z } from 'zod';

@Injectable()
export class ZodResponseInterceptor implements NestInterceptor {
  constructor(private schema: z.ZodType<any>) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        try {
          return this.schema.parse(data);
        } catch (err) {
          console.error(err);
          return data;
        }
      }),
    );
  }
}
