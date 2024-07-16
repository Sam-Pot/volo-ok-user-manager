import { IsString } from "class-validator";

export class UserId{
    @IsString()
    id!: string;
}