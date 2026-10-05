import { Between, type DataSource, type Repository } from "typeorm";
import { UserNotFoundError, type IDatabaseService } from "@domain";
import type { Location, Participant, User } from "@domain";
import { UserSchema } from "../database/schemas/UserSchema.js";
import type { UserRole } from "../database/schemas/UserRole.js";
import { LocationSchema } from "../database/schemas/LocationSchema.js";
import { LocationNotFoundError } from "@domain/errors/LocationErrors.js";
import { ParticipantSchema } from "../database/schemas/ParticipantSchema.js";

/* Implementación de IDatabaseService usando typeorm */
export class DatabaseService implements IDatabaseService {
  private userRepository: Repository<User>;
  private locationRepository: Repository<Location>;
  private participantRepository: Repository<Participant>;

  constructor(dataSource: DataSource) {
    this.userRepository = dataSource.getRepository(UserSchema);
    this.locationRepository = dataSource.getRepository(LocationSchema);
    this.participantRepository = dataSource.getRepository(ParticipantSchema);
  }

  async createUserWithRole(data: Omit<User, "id" | "isActive">): Promise<User> {
    try {
      const newUser = this.userRepository.create({
        ...data,
        isActive: true,
      });
      const savedUser = await this.userRepository.save(newUser);
      return savedUser;
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Failed to create user");
    }
  }

  async deleteUserById(id: string): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
      });

      if (!user) {
        throw new Error("User not found");
      }

      await this.userRepository.remove(user);
    } catch (error) {
      console.error(`Error deleting user with ID ${id}:`, error);
      throw new Error(
        `Failed to delete user: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: {
          location: true,
        },
      });
      return user;
    } catch (error) {
      console.error(`Error fetching user by ID ${id}:`, error);
      throw new Error(
        `Failed to fetch user: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async getAllUser(): Promise<User[]> {
    try {
      const users = await this.userRepository.find({
        order: { firstName: "ASC" },
        relations: {
          location: true,
        },
      });
      return users;
    } catch (error) {
      console.error("Error fetching all users:", error);
      throw new Error(
        `Failed to fetch users: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async getAllUsersByRole(role: UserRole): Promise<User[]> {
    try {
      return await this.userRepository.find({
        where: { role },
      });
    } catch (error) {
      console.error("Error fetching all users by role:", error);
      throw new Error(
        `Failed to fetch users: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where: { email },
      });
    } catch (error) {
      console.error(`Error fetching user by email ${email}:`, error);
      throw new Error("Failed to fetch user by email");
    }
  }

  async getUsersByRolePaginated(
    role: UserRole,
    skip: number,
    limit: number,
  ): Promise<{ users: User[]; total: number }> {
    try {
      const [users, total] = await this.userRepository.findAndCount({
        where: { role },
        relations: {
          location: true,
        },
        skip,
        take: limit,
        order: { firstName: "ASC" },
      });

      return { users, total };
    } catch (error) {
      console.error("Error fetching paginated users by role:", error);
      throw new Error("Failed to fetch users by role");
    }
  }

  async getUserForAuth(id: string): Promise<Omit<User, "password"> | null> {
    try {
      const user = await this.userRepository
        .createQueryBuilder("user")
        .select([
          "user.id",
          "user.firstName",
          "user.lastName",
          "user.email",
          "user.role",
          "user.isActive",
        ])
        .where("user.id = :id", { id })
        .getOne();

      return user ?? null;
    } catch (error) {
      console.error(`Error fetching auth user:`, error);
      throw new Error("Failed to fetch user for auth");
    }
  }

  async disableUserById(id: string): Promise<void> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
      });

      if (!user) {
        throw new UserNotFoundError();
      }

      user.isActive = false;
      await this.userRepository.save(user);
    } catch (error) {
      console.error(`Error disable user ${id}:`, error);
      throw new Error(
        `Failed to disable user: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async createLocation(
    data: Omit<Location, "id" | "isActive">,
  ): Promise<Location> {
    try {
      const newLocation = this.locationRepository.create({
        ...data,
        isActive: true,
      });
      const savedLocation = await this.locationRepository.save(newLocation);
      return savedLocation;
    } catch (error) {
      console.error("Error creating location:", error);
      throw new Error("Failed to create location");
    }
  }

  async getAllLocation(
    isActive: boolean,
  ): Promise<{ locations: Location[]; total: number }> {
    try {
      const [locations, total] = await this.locationRepository.findAndCount({
        order: { name: "ASC" },
        where: { isActive },
         relations: {
          users: true
        }
      });

      return {
        locations,
        total,
      };
    } catch (error) {
      console.error("Error fetching all locations:", error);
      throw new Error(
        `Failed to fetch locations: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async getLocationById(id: string): Promise<Location | null> {
    try {
      const location = await this.locationRepository.findOne({
        where: { id },
        relations: {
          users: true
        }
      });
      return location;
    } catch (error) {
      console.error(`Error fetching user by ID ${id}:`, error);
      throw new Error(
        `Failed to fetch user: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async updateLocation(locationId: string, updateData: Partial<Location>): Promise<Location> {
    try {
      const location = await this.locationRepository.findOne({
        where: { id: locationId },
      });
      if (!location) {
        throw new LocationNotFoundError();
      }
      
      const updateLocation = this.locationRepository.merge(location, updateData);
      await this.locationRepository.save(updateLocation);
      return updateLocation;
      
    } catch (error) {
      console.error(`Error updating location ${locationId}:`, error);
      throw new Error(
        `Failed to update location: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  } 

  async getParticipantByLocationId(locationId: string): Promise<Participant[] | null> {
    try {
      const participants = await this.participantRepository.find({
        where: { locationId },
      });
      return participants || null;
  
    } catch (error) {
      console.error(`Error fetching participants by location ID ${locationId}:`, error);
      throw new Error(
        `Failed to fetch participants: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async createParticipant(data: Omit<Participant, "id" | "isActive">): Promise<Participant> {
    try {
      const newParticipant = this.participantRepository.create({
        ...data,
        isActive: true,})

      const savedParticipant = await this.participantRepository.save(newParticipant);
      return savedParticipant;
    } catch (error) {
      console.error("Error creating participant:", error);
      throw new Error("Failed to create participant");
    }
  }

  async getParticipantByDocumentNumberAndLocationId(documentNumber: string, locationId: string): Promise<Participant | null> {
    try {
      const participant = await this.participantRepository.findOne({
        where: { documentNumber, locationId },
      });
      return participant;
    } catch (error) {
      console.error(`Error fetching participant by document number ${documentNumber}:`, error);
      throw new Error(
        `Failed to fetch participant: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
