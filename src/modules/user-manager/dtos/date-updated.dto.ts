import { IsBoolean } from "class-validator";

export class DateUpdated{
    @IsBoolean()
    updated!:boolean;
}