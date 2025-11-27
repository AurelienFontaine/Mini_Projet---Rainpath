import { Module } from '@nestjs/common';
import { CasesModule } from './cases/cases.module';
import { AppController } from './app.controller';

@Module({
  imports: [CasesModule],
  controllers: [AppController],
})
export class AppModule {}


