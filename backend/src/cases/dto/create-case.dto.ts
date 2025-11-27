import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';

export class CreateLameDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  coloration!: string;
}

export class CreateBlocDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLameDto)
  lames!: CreateLameDto[];
}

export class CreatePrelevementDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBlocDto)
  blocs!: CreateBlocDto[];
}

export class CreateCaseDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  id?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePrelevementDto)
  prelevements!: CreatePrelevementDto[];
}


