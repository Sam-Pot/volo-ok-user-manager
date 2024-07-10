import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";

export class UserRepository extends Repository<User> {
    constructor(
        @InjectRepository(User)
        private repository: Repository<User>,
    ) {
        super(repository.target, repository.manager, repository.queryRunner);
    }


}