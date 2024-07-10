import { IsBoolean, IsNumber } from "class-validator";

export class PointsResponse{
    @IsNumber()
    points!:number;
}