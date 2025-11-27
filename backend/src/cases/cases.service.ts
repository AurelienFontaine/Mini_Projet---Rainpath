import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CaseEntity } from './entities/case.entity';
import { CreateCaseDto } from './dto/create-case.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CasesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<CaseEntity[]> {
    const records = await this.prisma.case.findMany({
      include: {
        prelevements: {
          include: {
            blocs: {
              include: { lames: true },
            },
          },
        },
      },
    });
    return records as unknown as CaseEntity[];
  }

  async getById(id: string): Promise<CaseEntity> {
    const found = await this.prisma.case.findUnique({
      where: { id },
      include: {
        prelevements: { include: { blocs: { include: { lames: true } } } },
      },
    });
    if (!found) throw new NotFoundException(`Case with id '${id}' not found`);
    return found as unknown as CaseEntity;
  }

  async create(dto: CreateCaseDto): Promise<CaseEntity> {
    const id = dto.id?.trim().length ? dto.id : uuidv4();
    // ensure uniqueness
    const existing = await this.prisma.case.findUnique({ where: { id } });
    if (existing) throw new BadRequestException(`Case with id '${id}' already exists`);

    const created = await this.prisma.case.create({
      data: {
        id,
        prelevements: {
          create: dto.prelevements.map((p) => ({
            id: p.id,
            blocs: {
              create: p.blocs.map((b) => ({
                id: b.id,
                lames: {
                  create: b.lames.map((l) => ({
                    id: l.id,
                    coloration: l.coloration,
                  })),
                },
              })),
            },
          })),
        },
      },
      include: {
        prelevements: { include: { blocs: { include: { lames: true } } } },
      },
    });
    return created as unknown as CaseEntity;
  }

  async deleteById(id: string): Promise<void> {
    // Ensure exists to return 404 if not
    const existing = await this.prisma.case.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Case with id '${id}' not found`);
    await this.prisma.case.delete({ where: { id } });
  }
}


