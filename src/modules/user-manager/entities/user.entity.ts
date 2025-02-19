import { IsDate, IsDefined, IsEmail, IsNumber, IsOptional, IsString } from "class-validator";
import { CustomBaseEntity } from "src/shared-modules/database/entities/custom-base.entity";
import { Column, Entity, Index } from "typeorm";
import { Role } from "../configs/role";

@Entity()
export class User extends CustomBaseEntity {

    @Column({ nullable: true })
    @Index()
    @IsOptional()
    @IsString()
    name?: string;

    @Column({ nullable: true })
    @Index()
    @IsString()
    surname?: string;

    @Column({ nullable: true, type:"bigint"})
    @IsOptional()
    birthDate?: number;

    @Column({ nullable: true, unique: true })
    @IsOptional()
    @IsString()
    customerCode?: string;

    @Column()
    @Index()
    @IsDefined()
    role!: Role;

    @Column({ nullable: true })
    @IsOptional()
    @IsNumber()
    residualPoints?: number;

    @Column({ nullable: true })
    @IsOptional()
    @IsNumber()
    pointsUsed?: number;

    @Column({ unique: true })
    @IsEmail()
    email!: string;

    @Column()
    @IsString()
    saltedPassword!: string;

    @Column({ nullable: true })
    @IsOptional()
    @IsDate()
    lastPurchaseDate?: Date;
}