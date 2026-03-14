import { IsString, IsNotEmpty, IsISO8601, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UserDto {
    @IsString()
    @IsNotEmpty()
    id: string;
}

export class CreateEventDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsISO8601()
    @IsNotEmpty()
    start: string;

    @IsISO8601()
    @IsNotEmpty()
    end: string;

    @IsString()
    @IsNotEmpty()
    type: string;

    @ValidateNested()
    @Type(() => UserDto)
    user: UserDto;
}