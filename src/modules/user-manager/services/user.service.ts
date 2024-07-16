import { Inject, Injectable } from "@nestjs/common";
import { UserRepository } from "../repositories/user.repository";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../entities/user.entity";
import * as crypto from 'crypto';
import { Role } from "../configs/role";
import { Paginate, PaginateQuery, Paginated, paginate } from "nestjs-paginate";
import { Transactional } from "typeorm-transactional";
import { MoreThan } from "typeorm";
import { EmailTemplateConstants } from "../configs/email-template.constants";
import { EmailDto } from "../dtos/email.dto";

@Injectable()
export class UserService {

    constructor(
        @InjectRepository(UserRepository)
        private readonly repository: UserRepository,
    ) { }


    /**
     * This method, given a user, save or update a User entity.
     * @param user User
     * @returns Promise<User | undefined>
     * @example 
     * let newUser: User | undefined = await this.userService.saveOrUpdate(user);
     * 
     * UPDATE fails if:
     * -there are no users with the specified id;
     * -the user is a loyalty customer but name or surname or birthdate have not been specified.
     * 
     * SAVE fails if:
     * -email or password have not been specified.
     */
    @Transactional()
    async saveOrUpdate(user: User): Promise<User | undefined> {
        if (!user) {
            return undefined;
        }
        let userToUpdate: User | null = null;
        //UPDATE CASE
        if (user.id) {
            userToUpdate = await this.repository.findOneBy({ id: user.id });
            //USER WITH THE SPECIFIED ID DOESN'T EXISTS
            if (!userToUpdate) {
                return undefined;
            }
            //LOYALTY CUSTOMER
            if (user.role == Role.LOYALTY_CUSTOMER) {
                if (!user.name || !user.surname || !user.birthDate) {
                    return undefined;
                }
                userToUpdate.name = user.name;
                userToUpdate.surname = user.surname;
                userToUpdate.birthDate = user.birthDate;
                //THE FIRST TIME A CUSTOMER BECOME A LOYALTY CUSTOMER
                if (!user.customerCode) {
                    let customerCode: string = crypto.randomBytes(8).toString("hex");
                    userToUpdate.customerCode = customerCode;
                    userToUpdate.pointsUsed = 0;
                    userToUpdate.residualPoints = 0;
                    userToUpdate.role = Role.LOYALTY_CUSTOMER;
                }
            }else{
                userToUpdate.name = undefined;
                userToUpdate.surname = undefined;
                userToUpdate.birthDate = undefined;
            }
            //GENERIC UPDATE
            if (user.email) {
                userToUpdate.email = user.email;
            }
            if (user.saltedPassword) {
                userToUpdate.saltedPassword = user.saltedPassword;
            }
            if (user.lastPurchaseDate) {
                userToUpdate.lastPurchaseDate = new Date(user.lastPurchaseDate);
            }
        } else {
            //SAVE CASE
            if (!user.email || !user.saltedPassword) {
                return undefined;
            }
            userToUpdate = {
                email: user.email,
                saltedPassword: user.saltedPassword,
                role: user.role
            };
        }
        try {
            let ret:User = await this.repository.save(userToUpdate);
            return ret;
        } catch (e) {
            return undefined;
        }
    }

    /**
     * This method, given a query, find and return a paginated list of users.
     * @param query PaginateQuery
     * @returns Promise<Paginated<User> | undefined>
     * @example 
     * let response: Paginated<User> | undefined> = await this.userService.find({ path: 'http://localhost',filter:{"name":"$ilike:Mario"}, select:['id']});
     */
    async find(@Paginate()query: PaginateQuery): Promise<Paginated<User> | undefined> {
        try {
            query = {path:"localhost:80"};
            return await paginate(query, this.repository, {
                sortableColumns: [
                    'id',
                    'updatedAt',
                    'createdAt',
                    'name',
                    'surname',
                    'email',
                    'lastPurchaseDate',
                ],
                filterableColumns: {
                    'name': true,
                    'id': true,
                    'updatedAt': true,
                    'createdAt': true,
                    'surname': true,
                    'email': true,
                    'role': true,
                    'lastPurchaseDate': true,
                    'residualPoints': true,
                    'pointsUsed': true,
                },
                searchableColumns: ["createdAt", "updatedAt", "id", "name", "surname", "email", "role", "customerCode"],
                select: ["createdAt", "updatedAt", "id", "name", "surname",
                    "email", "role", "customerCode", "birthDate", "lastPurchaseDate", "residualPoints", "pointsUsed",],
                defaultSortBy: [['id', 'ASC']],
            });
        } catch (e) {
            return undefined;
        }
    }

    /**
     * This method given email, returns the user that has this emaill.
     * The research can only be filtered by email.
     * 
     * @param emailAddress string
     * @returns Promise<User | undefined>
     * @example
     * let user: User | undefined = await this.userService.findOne(email);
     */
    async findOneByEmail(emailAddress: string): Promise<User | undefined> {
        try {
            let response: User | null = await this.repository.findOneBy({ email: emailAddress });
            if (!response) {
                return undefined;
            }
            return response;
        } catch (e) {
            return undefined;
        }
    }

    /**
     * This method given an id, returns the user that has this id.
     * The research can only be filtered by id.
     * 
     * @param id string
     * @returns Promise<User | undefined>
     * @example
     * let user: User | undefined = await this.userService.findOne(userId);
     */
    async findOne(userId: string): Promise<User | undefined> {
        try {
            let response: User | null = await this.repository.findOneBy({ id: userId });
            if (!response) {
                return undefined;
            }
            return response;
        } catch (e) {
            return undefined;
        }
    }

    /**
     * This method given the id of a user, clear the user data, changing his role to CUSTOMER.
     * Then return the user.
     * This method is executed as a Transaction.
     * @param id string
     * @returns Promise<User | undefined>
     * @example 
     * let user: User | undefined = await this.userService.clearData("fakeID");
     */
    @Transactional()
    async clearData(id: string): Promise<User | undefined> {
        let userToClean: User | null = await this.repository.findOneBy({ id: id });
        if (!userToClean) {
            return undefined;
        }
        userToClean.birthDate = undefined;
        userToClean.name = "";
        userToClean.surname = "";
        userToClean.role = Role.CUSTOMER;
        userToClean.email = userToClean.id + "@" + "deleted" + ".com";
        userToClean.saltedPassword = crypto.randomBytes(8).toString("hex");
        try {
            return await this.repository.save(userToClean);
        } catch (e) {
            console.log(e);
            return undefined;
        }
    }

    /**
     * This method, given the id of a user and a number of points, increments the user.residualPoints.
     * This method is executed as a transaction.
     * it FAILS if:
     * -there is no user with the specified id;
     * -the user role is not a LOYALTY_CUSTOMER
     * -the inserted customerCode is wrong
     * @param userId string
     * @param points number
     * @returns Promise<boolean>
     * @example
     * let response: boolean = this.userService.addPoints("fakeID", 500 );
     */
    @Transactional()
    async addPoints(userId: string, customerCode: string, points: number): Promise<number | undefined> {
        let user: User | null = await this.repository.findOneBy({ id: userId });
        if (!user || user.role != Role.LOYALTY_CUSTOMER
            || user.residualPoints == undefined || user.residualPoints == null
            || customerCode != user.customerCode) {
            return undefined;
        }
        user.residualPoints += points;
        try {
            let updatedUser: User | undefined = await this.repository.save(user);
            if (!updatedUser) {
                return undefined;
            }
            return updatedUser.residualPoints;
        } catch (e) {
            return undefined;
        }
    }

    /**
     * This method, given the id of a user and a number of points, decrements 
     * the user.residualPoints and  the user.PointsUsed.
     * This method is executed as a transaction.
     * it FAILS if:
     * -there is no user with the specified id;
     * -the user role is not a LOYALTY_CUSTOMER
     * -the inserted customerCode is wrong
     * @param userId string
     * @param points number
     * @returns Promise<boolean>
     * @example
     * let response: boolean = this.userService.usePoints("fakeID", 500 );
     */
    @Transactional()
    async usePoints(userId: string, customerCode: string, points: number): Promise<number | undefined> {
        let user: User | null = await this.repository.findOneBy({ id: userId });
        if (!user || user.role != Role.LOYALTY_CUSTOMER || user.residualPoints == undefined
            || user.residualPoints == null || user.pointsUsed == undefined
            || user.pointsUsed == null || customerCode != user.customerCode) {
            return undefined;
        }
        user.residualPoints -= points;
        user.pointsUsed += points;
        try {
            let userUpdated: User | undefined = await this.repository.save(user);
            if (!userUpdated) {
                return undefined;
            }
            return userUpdated.residualPoints;
        } catch (e) {
            return undefined;
        }
    }

    @Transactional()
    async setLastPurchaseDate(dateMillis: number, userId: string): Promise<boolean> {
        let userToUpdate: User | null = await this.repository.findOneBy({ id: userId });
        if (!userToUpdate) {
            return false;
        }
        await this.repository.update(
            {
                id: userId
            },
            {
                lastPurchaseDate: new Date(dateMillis)
            }
        );
        return true;
    }

    /**
     * This method find the users that are no longer loyal and clear their 
     * personal data and points(the user role is changed to CUSTOMER).
     * @param years number
     * @returns Promise<EmailDto[]>
     */
    @Transactional()
    async checkLoyalty(years: number): Promise<EmailDto[]> {
        let emailList: EmailDto[] = [];
        let checkDate = new Date().getTime() - (years * 365 * 24 * 60 * 60 * 1000);
        let usersToNotify: User[] | null = await this.repository.find(
            {
                where: {
                    role: Role.LOYALTY_CUSTOMER,
                    lastPurchaseDate: MoreThan(new Date(checkDate))
                }
            }
        );
        if (usersToNotify) {
            for (let user of usersToNotify) {
                if (user?.id) {
                    this.repository.update(
                        {
                            id: user.id
                        },
                        {
                            residualPoints: 0
                        }
                    );
                }
            }
            //GENERATE EMAIL TEMPLATES
            for (let user of usersToNotify) {
                if (user?.id) {
                    let emailDto: EmailDto = {
                        to: user.email,
                        subject: EmailTemplateConstants.SUBJECT,
                        text: EmailTemplateConstants.TEXT,
                        html: EmailTemplateConstants.HTML
                    };
                    emailList.push(emailDto);
                }
            }
        }
        return emailList;
    }
}