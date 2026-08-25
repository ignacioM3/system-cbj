import type { UserRole } from "@domain/entities/User-Role.js";
import type { User } from "@domain/entities/Users.js";
import type { IDatabaseService } from "@domain/services/IDatabaseService.js";

export interface GetUserByRolInput {
  rol: UserRole;
  page: number;
  limit: number;
}

export interface GetUserByRolOutput {
  users: User[];
  total: number;
}

export class GetUserByRolUseCase {
  constructor(private db: IDatabaseService) {}

  async execute(input: GetUserByRolInput): Promise<GetUserByRolOutput> {
    const skip = (input.page - 1) * input.limit
    return this.db.getUsersByRolePaginated(
        input.rol,
        input.limit,
        skip
    )
  }
}
