import { Between, type DataSource, type Repository } from "typeorm";
import { type IDatabaseService } from "@domain";
import type { Location, User } from "@domain";
import { UserSchema } from "../database/schemas/UserSchema.js";
import type { UserRole } from "../database/schemas/UserRole.js";
import { LocationSchema } from "../database/schemas/LocationSchema.js";

/* Implementación de IDatabaseService usando typeorm */
export class DatabaseService implements IDatabaseService {
    private userRepository: Repository<User>
    private locationRepository: Repository<Location>

    constructor(dataSource: DataSource) {
        this.userRepository = dataSource.getRepository(UserSchema)
        this.locationRepository = dataSource.getRepository(LocationSchema)
    }

    async deleteUserById(id: string): Promise<void> {
        try {
            const user = await this.userRepository.findOne({
                where: { id }
            });

            if (!user) {
                throw new Error("User not found");
            }

            await this.userRepository.remove(user);

        } catch (error) {
            console.error(`Error deleting user with ID ${id}:`, error);
            throw new Error(
                `Failed to delete user: ${error instanceof Error ? error.message : String(error)
                }`
            );
        }
    }



    async getUserById(id: string): Promise<User | null> {
        try {
            const user = await this.userRepository.findOne({
                where: { id }
            })
            return user
        } catch (error) {
            console.error(`Error fetching user by ID ${id}:`, error);
            throw new Error(
                `Failed to fetch user: ${error instanceof Error ? error.message : String(error)
                }`
            );
        }

    }

    async getAllUser(): Promise<User[]> {
        try {
            const users = await this.userRepository.find({
                order: { firstName: 'ASC' }
            });
            return users;
        } catch (error) {
            console.error("Error fetching all users:", error);
            throw new Error(
                `Failed to fetch users: ${error instanceof Error ? error.message : String(error)
                }`
            );
        }
    }

    async getAllUsersByRole(role: UserRole): Promise<User[]> {
        try {
            return await this.userRepository.find({
                where: { role }
            })
        } catch (error) {
            console.error("Error fetching all users by role:", error);
            throw new Error(
                `Failed to fetch users: ${error instanceof Error ? error.message : String(error)
                }`
            );
        }
    }

  
    async getUserByEmail(email: string): Promise<User | null> {
        try {
            return await this.userRepository.findOne({
                where: { email }
            });
        } catch (error) {
            console.error(`Error fetching user by email ${email}:`, error);
            throw new Error("Failed to fetch user by email");
        }
    }

    async getUsersByRolePaginated(
        role: UserRole,
        skip: number,
        limit: number
    ): Promise<{ users: User[]; total: number }> {
        try {
            const [users, total] = await this.userRepository.findAndCount({
                where: { role },
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


    async createLocation(data: Omit<Location, 'id' | 'isActive'>): Promise<Location> {
        try {
            const newLocation = this.locationRepository.create({
                ...data,
                isActive: true
            });
            const savedLocation = await this.locationRepository.save(newLocation);
            return savedLocation;
        } catch (error) {
            console.error("Error creating location:", error);
            throw new Error("Failed to create location");
        }      
    }

    async getAllLocation(isActive: boolean): Promise<{locations: Location[], total: number}>{
        try {
            const [locations, total] = await this.locationRepository.findAndCount({
                 order: { name: 'ASC' },
                 where: {isActive}
            })

            return {
                locations,
                total
            }
        } catch (error) {
            console.error("Error fetching all locations:", error);
            throw new Error(
                `Failed to fetch locations: ${error instanceof Error ? error.message : String(error)
                }`
            );
        }
    }
}