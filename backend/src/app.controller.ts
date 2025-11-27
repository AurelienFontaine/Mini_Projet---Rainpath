import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/')
  root() {
    return {
      status: 'ok',
      message: 'Rainpath API is running',
      endpoints: [
        { method: 'GET', path: '/cases' },
        { method: 'GET', path: '/cases/:id' },
        { method: 'POST', path: '/cases' },
      ],
    };
  }
}


