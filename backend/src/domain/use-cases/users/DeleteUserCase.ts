import { RequiredIDError, UserNotFoundError } from "@domain/errors/UsersErrors.js";
import type { IDatabaseService } from "@domain/services/IDatabaseService.js";

export interface DeleteUserCaseInput {
  userId?: string;
}

export class DeleteUserUseCase {
  constructor(private readonly db: IDatabaseService) {}

  async execute(input: DeleteUserCaseInput): Promise<void> {
    const { userId } = input;

    if (!userId) {
      throw new RequiredIDError();
    }

      const user = await this.db.getUserById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    await this.db.deleteUserById(userId)
  }
}
