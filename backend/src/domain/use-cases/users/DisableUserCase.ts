import { RequiredIDError, UserNotFoundError } from "@domain/errors/UsersErrors.js";
import type { IDatabaseService } from "@domain/services/IDatabaseService.js";

export interface DisableUserInput {
    userId?: string;
}

export class DisableUserUseCase {
  constructor(private readonly db: IDatabaseService) {}

  async execute(input: DisableUserInput): Promise<void> {
    const { userId } = input;

    if (!userId) {
      throw new RequiredIDError();
    }

    const user = await this.db.getUserById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    await this.db.disableUserById(userId);
  }
}
