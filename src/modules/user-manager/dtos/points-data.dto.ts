import { IsNumber, IsString } from "class-validator";

export class PointsData {
    @IsString()
    userId!: string;
    @IsNumber()
    points!:number;
    @IsString()
    customerCode!:string;

}