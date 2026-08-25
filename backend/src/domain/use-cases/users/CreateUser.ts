import type { User, UserRole } from "@domain";
import type { IDatabaseService } from "../../services/IDatabaseService.js";

export interface CreateUserInput{
    newUser : Omit<User, "id" | "isActive" | "role">
    role: UserRole
}

export interface CreateUserOutput{
    createdUser: User
}

export class CreateUserUseCase{
    constructor(private db: IDatabaseService){}

    async execute(input: CreateUserInput): Promise<CreateUserOutput>{
        
        const createdUser = await this.db.createUserWithRole({...input.newUser, role: input.role} );
        return { createdUser }
    }
}