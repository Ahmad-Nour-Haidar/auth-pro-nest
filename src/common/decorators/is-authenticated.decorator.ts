import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export const IsAuthenticated = () => UseGuards(AuthGuard('jwt'));
