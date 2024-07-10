import { IsDefined, IsNumber } from "class-validator";
import { User } from "../entities/user.entity";

export class PaginatedUsers {

    @IsDefined({ each: true })
    users!: User[];

    @IsNumber()
    elementsNumber!: number;
}