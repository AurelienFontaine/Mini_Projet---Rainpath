import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { CasesService } from './cases.service';
import { CreateCaseDto } from './dto/create-case.dto';
import { CaseEntity } from './entities/case.entity';

@Controller()
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Get('cases')
  async findAll(): Promise<CaseEntity[]> {
    return this.casesService.getAll();
  }

  @Get('cases/:id')
  async findOne(@Param('id') id: string): Promise<CaseEntity> {
    return this.casesService.getById(id);
  }

  @Post('cases')
  async create(@Body() dto: CreateCaseDto): Promise<CaseEntity> {
    return this.casesService.create(dto);
  }

  @Delete('cases/:id')
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    return this.casesService.deleteById(id);
  }
}


