import { IsEmail } from "class-validator";

export class EmailAddress {
    @IsEmail()
    emailAddress!: string;
}