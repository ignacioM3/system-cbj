import type { UserRole } from "@domain/entities/User-Role.js";
import type { User } from "@domain/entities/Users.js";
import type { IDatabaseService } from "@domain/services/IDatabaseService.js";

export interface GetUserByRoleInput {
  role: UserRole;
  page?: number;
  limit?: number;
}

export interface GetUserByRoleOutput {
  users: User[];
  total: number;
}

export class GetUsersByRoleUseCase {
  constructor(private db: IDatabaseService) {}

  async execute(input: GetUserByRoleInput): Promise<GetUserByRoleOutput> {
      const page = input.page ?? 1;
      const limit = input.limit ?? 6;

    const skip = (page - 1) * limit
    return this.db.getUsersByRolePaginated(
        input.role,
        skip,
        limit
    )
  }
}
