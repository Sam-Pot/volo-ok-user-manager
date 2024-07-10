import { IsNumber, IsString } from "class-validator";

export class LastPurchaseDto {
    @IsNumber()
    date!: number;
    @IsString()
    userId!: string;
}