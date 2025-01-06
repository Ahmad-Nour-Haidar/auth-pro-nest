import { minutes, Throttle } from '@nestjs/throttler';

export function CustomThrottle(limit: number, ttl: number) {
  return Throttle({ default: { limit, ttl } });
}

export function CustomThrottleMinutes(limit: number, minute: number) {
  return Throttle({ default: { limit, ttl: minutes(minute) } });
}

export function CustomThrottleAuth() {
  return Throttle({ default: { limit: 4, ttl: minutes(1) } });
}
