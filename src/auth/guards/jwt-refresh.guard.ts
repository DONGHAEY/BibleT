import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard as NestAuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshGuard extends NestAuthGuard('jwt-refresh-token') {}
