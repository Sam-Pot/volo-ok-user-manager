import { IsString } from "class-validator";

export class UserId{
    @IsString()
    userId!: string;
}