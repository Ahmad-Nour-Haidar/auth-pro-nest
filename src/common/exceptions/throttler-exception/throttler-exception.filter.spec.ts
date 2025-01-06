import { ThrottlerExceptionFilter } from './throttler-exception.filter';

describe('ThrottlerExceptionFilter', () => {
  it('should be defined', () => {
    expect(new ThrottlerExceptionFilter()).toBeDefined();
  });
});
