import { Controller } from "@nestjs/common";
import { GrpcMethod, RpcException } from "@nestjs/microservices";
import { User } from "../entities/user.entity";
import { Metadata, ServerUnaryCall } from "@grpc/grpc-js";
import { Paginated } from "nestjs-paginate";
import { PaginatedUsers } from "../dtos/paginated-users.dto";
import { PaginateQueryDto } from "../../../shared-modules/dtos/paginate-query.dto"
import { UserId } from "../dtos/user-id.dto";
import { EmailAddress } from "../dtos/email-address.dto";
import { PointsData } from "../dtos/points-data.dto";
import { PointsResponse } from "../dtos/points-response.dto";
import { LastPurchaseDto } from "../dtos/last-purchase.dto";
import { DateUpdated } from "../dtos/date-updated.dto";
import { Years } from "../dtos/years.dto";
import { EmailList } from "../dtos/email-list.dto";
import { EmailDto } from "../dtos/email.dto";
import { UserService } from "../services/user.service";

@Controller()
export class UserController {
    constructor(
        private userService: UserService
    ) { }

    @GrpcMethod('UserService', 'saveOrUpdate')
    async saveOrUpdate(user: User, metadata: Metadata, call: ServerUnaryCall<any, any>): Promise<User> {
        let savedUser: User | undefined = await this.userService.saveOrUpdate(user);
        if (!savedUser) {
            throw new RpcException("SAVE OR UPDATE FAILED");
        }
        return savedUser;
    }

    @GrpcMethod('UserService', 'find')
    async find(queryDto: PaginateQueryDto, metadata: Metadata, call: ServerUnaryCall<any, any>): Promise<PaginatedUsers> {
        let query = queryDto?.query?queryDto.query:"";
        let users: Paginated<User> | undefined = await this.userService.find(query as any);
        if (!users) {
            throw new RpcException("FIND FAILED");
        }
        let response: PaginatedUsers = {
            elementsNumber: users.meta.totalItems,
            users: users.data
        };
        return response;
    }

    @GrpcMethod('UserService', 'findOne')
    async findOne(userIdDto: UserId, metadata: Metadata, call: ServerUnaryCall<any, any>): Promise<User> {
        let user: any = await this.userService.findOne(userIdDto.id);
        if (!user) {
            throw new RpcException("FIND ONE FAILED");
        }
        return user;
    }

    @GrpcMethod('UserService', 'findOneByEmail')
    async findOneByEmail(emailDto: EmailAddress, metadata: Metadata, call: ServerUnaryCall<any, any>): Promise<User> {
        let user: User | undefined = await this.userService.findOneByEmail(emailDto.emailAddress);
        if (!user) {
            throw new RpcException("FIND ONE BY EMAIL FAILED");
        }
        return user;
    }

    @GrpcMethod('UserService', 'clearData')
    async clearData(userId: UserId, metadata: Metadata, call: ServerUnaryCall<any, any>): Promise<User> {
        let user: User | undefined = await this.userService.clearData(userId.id);
        if (!user) {
            throw new RpcException("CLEAR DATA FAILED");
        }
        return user;
    }

    @GrpcMethod('UserService', 'addPoints')
    async addPoints(pointsData: PointsData, metadata: Metadata, call: ServerUnaryCall<any, any>): Promise<PointsResponse> {
        let residualPoints: number | undefined = await this.userService.addPoints(pointsData.userId, pointsData.customerCode, pointsData.points);
        if (residualPoints == undefined) {
            throw new RpcException("ADD POINTS FAILED");
        }
        let response: PointsResponse = {
            points: residualPoints
        };
        return response;
    }

    @GrpcMethod('UserService', 'usePoints')
    async usePoints(pointsData: PointsData, metadata: Metadata, call: ServerUnaryCall<any, any>): Promise<PointsResponse> {
        let residualPoints: number | undefined = await this.userService.usePoints(pointsData.userId, pointsData.customerCode, pointsData.points);
        if (residualPoints == undefined) {
            throw new RpcException("USE POINTS FAILED");
        }
        let response: PointsResponse = {
            points: residualPoints
        };
        return response;
    }

    @GrpcMethod('UserService', 'setLastPurchaseDate')
    async setLastPurchaseDate(lastPurchaseDto: LastPurchaseDto,metadata: Metadata, call: ServerUnaryCall<any, any>): Promise<DateUpdated> {
        let dataUpdated: boolean = await this.userService.setLastPurchaseDate(lastPurchaseDto.date, lastPurchaseDto.userId);
        let response: DateUpdated = {
            updated: dataUpdated
        };
        return response;
    }

    @GrpcMethod('UserService', 'checkLoyalty')
    async checkLoyalty(years: Years, metadata: Metadata, call: ServerUnaryCall<any, any>): Promise<EmailList> {
        let emailTemplates: EmailDto[] = await this.userService.checkLoyalty(years.year);
        let response: EmailList = {
            emailTemplates: emailTemplates
        };
        return response;
    }

}