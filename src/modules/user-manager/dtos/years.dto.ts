import { IsNumber } from "class-validator";

export class Years {
    @IsNumber()
    year!: number;
}