import { SetMetadata } from '@nestjs/common';

export const PUBLIC_ROUTE_KEY = 'PUBLIC_ROUTE_KEY';

export const Public = () => SetMetadata(PUBLIC_ROUTE_KEY, true);
