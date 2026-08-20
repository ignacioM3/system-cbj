import crypto from "crypto";
import bcrypt from "bcrypt";
import type { User, Participant, Location, Attendance } from "@domain";
import { AppDataSource, InitializeDatabase } from "../database/data-source.js";
import { UserRole } from "../../domain/entities/User-Role.js";

async function seedDatabase(): Promise<void> {
    try {
        await InitializeDatabase();

        const locationRepo = AppDataSource.getRepository("Location");
        const existingLocations = await locationRepo.count();

        if (existingLocations > 0) {
            console.log("⚠️  Database already contains data. Skipping seed.");
            return;
        }

        console.log("🌱 Starting database seed...");

        const userRepo = AppDataSource.getRepository('User');
        const AttendanceRepo = AppDataSource.getRepository('Attendance');
        const ParticipantRepo = AppDataSource.getRepository('Participant');

        // ═══════════════════════════════════════════════════════════
        // 1. USUARIOS ADMIN (hasheados con bcrypt)
        // ═══════════════════════════════════════════════════════════
        console.log("👤 Seeding admin users...");
        const hashedPassword = await bcrypt.hash("admin123", 10);

        const adminUsers: User[] = [
            {
                id: crypto.randomUUID(),
                firstName: "Nacho",
                lastName: "Marquez",
                documentNumber: "12345678",
                birthDate: new Date("1999-08-20"),
                email: "nacho@cbj.org",
                password: hashedPassword,
                role: UserRole.ADMIN,
                isActive: true,
            },
            {
                id: crypto.randomUUID(),
                firstName: "Laura",
                lastName: "González",
                documentNumber: "28456789",
                birthDate: new Date("1985-05-15"),
                email: "laura@cbj.org",
                password: hashedPassword,
                role: UserRole.ADMIN,
                isActive: true,
            },
            {
                id: crypto.randomUUID(),
                firstName: "Martín",
                lastName: "Rodríguez",
                documentNumber: "30123456",
                birthDate: new Date("1990-03-10"),
                email: "martin@cbj.org",
                password: hashedPassword,
                role: UserRole.ADMIN,
                isActive: true,
            },
        ];

        const savedAdmins = await userRepo.save(adminUsers);
        console.log(`✅ Seeded ${savedAdmins.length} admin users`);

        // ═══════════════════════════════════════════════════════════
        // 2. SEDES (Locations)
        // ═══════════════════════════════════════════════════════════
        console.log("🏢 Seeding locations...");
        const locationsData: Location[] = [
            {
                id: crypto.randomUUID(),
                name: "Sede Centro",
                address: "Av. San Martín 1234",
                isActive: true,
            },
            {
                id: crypto.randomUUID(),
                name: "Sede Barrio Norte",
                address: "Calle Belgrano 567",
                isActive: true,
            },
            {
                id: crypto.randomUUID(),
                name: "Sede Barrio Sur",
                address: "Pasaje Los Pinos 89",
                isActive: true,
            },
            {
                id: crypto.randomUUID(),
                name: "Sede Polideportivo",
                address: "Av. Libertad 2345",
                isActive: true,
            },
        ];

        const savedLocations = await locationRepo.save(locationsData);
        console.log(`✅ Seeded ${savedLocations.length} locations`);

        // ═══════════════════════════════════════════════════════════
        // 3. PARTICIPANTES
        // ═══════════════════════════════════════════════════════════
        console.log("👥 Seeding participants...");
        const participantsData: Participant[] = [
            // Chicos con DNI
            {
                id: crypto.randomUUID(),
                firstName: "Mateo",
                lastName: "Fernández",
                documentNumber: "55123456",
                birthDate: new Date("2012-03-15"),
                phone: "2615123456",
                isActive: true,
                created_at: new Date(),
            },
            {
                id: crypto.randomUUID(),
                firstName: "Valentina",
                lastName: "López",
                documentNumber: "56789012",
                birthDate: new Date("2011-07-22"),
                phone: "2615234567",
                isActive: true,
                created_at: new Date(), 
            },
            {
                id: crypto.randomUUID(),
                firstName: "Santiago",
                lastName: "Martínez",
                documentNumber: "57345678",
                birthDate: new Date("2013-11-08"),
                isActive: true,
                created_at: new Date(),
            },
            {
                id: crypto.randomUUID(),
                firstName: "Camila",
                lastName: "García",
                documentNumber: "58901234",
                birthDate: new Date("2010-05-30"),
                phone: "2615345678",
                isActive: true,
                created_at: new Date(),
            },
            {
                id: crypto.randomUUID(),
                firstName: "Benjamín",
                lastName: "Sánchez",
                documentNumber: "59456789",
                birthDate: new Date("2014-02-14"),
                isActive: true,
                created_at: new Date(),
            },
            {
                id: crypto.randomUUID(),
                firstName: "Martina",
                lastName: "Díaz",
                documentNumber: "60012345",
                birthDate: new Date("2012-09-18"),
                phone: "2615456789",
                isActive: true,
                created_at: new Date(),
            },
            {
                id: crypto.randomUUID(),
                firstName: "Thiago",
                lastName: "Pérez",
                documentNumber: "61567890",
                birthDate: new Date("2011-12-03"),
                isActive: true,
                created_at: new Date(),
            },
            {
                id: crypto.randomUUID(),
                firstName: "Sofía",
                lastName: "Romero",
                documentNumber: "62123098",
                birthDate: new Date("2013-06-25"),
                phone: "2615567890",
                 isActive: true,
                created_at: new Date(),
            },
            {
                id: crypto.randomUUID(),
                firstName: "Lautaro",
                lastName: "Torres",
                birthDate: new Date("2016-04-10"),
                phone: "2615678901",
                 documentNumber: "62123098",
                  isActive: true,
                created_at: new Date()
            },
            {
                id: crypto.randomUUID(),
                firstName: "Agustina",
                lastName: "Flores",
                birthDate: new Date("2015-08-19"),
                 documentNumber: "62123098",
                  isActive: true,
                created_at: new Date()
            },
            {
                id: crypto.randomUUID(),
                firstName: "Bruno",
                lastName: "Acosta",
                birthDate: new Date("2017-01-27"),
                phone: "2615789012",
                documentNumber: "62123098",
                  isActive: true,
                created_at: new Date()
            }
        ];

        const savedParticipants = await ParticipantRepo.save(participantsData);
        console.log(`✅ Seeded ${savedParticipants.length} participants`);

        // ═══════════════════════════════════════════════════════════
        // 4. ASISTENCIAS (distribuidas en las últimas 2 semanas)
        // ═══════════════════════════════════════════════════════════
        console.log("📅 Seeding attendances...");

        // Helper para generar fechas recientes
        const daysAgo = (days: number): Date => {
            const date = new Date();
            date.setDate(date.getDate() - days);
            return date;
        };

        const helperTime = (hours: number, minutes: number): string => {
            return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
        };

        // Asistencias distribuidas por sede y día
        const attendancesData: Attendance[] = [];

        // Día 0 (hoy) - Sede Centro
        [0, 1, 2, 3, 4].forEach((idx) => {
            if (savedParticipants[idx] && savedLocations[0]) {
                attendancesData.push({
                    id: crypto.randomUUID(),
                    participantId: savedParticipants[idx].id,
                    locationId: savedLocations[0].id, // Sede Centro
                    date: daysAgo(0),
                    time: helperTime(14, 30 + idx * 5),
                    isActive: true,
                });
            }
        });

        // Día 1 (ayer) - Sede Norte
        [1, 3, 5, 7, 9, 11].forEach((idx) => {
            if (savedParticipants[idx] && savedLocations[1]) {
                attendancesData.push({
                    id: crypto.randomUUID(),
                    participantId: savedParticipants[idx].id,
                    locationId: savedLocations[1].id, // Sede Norte
                    date: daysAgo(1),
                    time: helperTime(15, 10 + idx),
                    isActive: true,
                });
            }
        });

        // Día 2 - Sede Sur
        [0, 2, 4, 6, 8, 10, 12].forEach((idx) => {
            if (savedParticipants[idx] && savedLocations[2]) {
                attendancesData.push({
                    id: crypto.randomUUID(),
                    participantId: savedParticipants[idx].id,
                    locationId: savedLocations[2].id, // Sede Sur
                    date: daysAgo(2),
                    time: helperTime(14, 45 + idx),
                    isActive: true,
                });
            }
        });

        // Día 3 - Polideportivo
        [0, 1, 2, 5, 6, 7, 8, 13, 14].forEach((idx) => {
            if (savedParticipants[idx] && savedLocations[3]) {
                attendancesData.push({
                    id: crypto.randomUUID(),
                    participantId: savedParticipants[idx].id,
                    locationId: savedLocations[3].id, // Polideportivo
                    date: daysAgo(3),
                    time: helperTime(16, 0 + idx * 3),
                    isActive: true,
                });
            }
        });

        // Día 5 - Sede Centro (otro grupo)
        [5, 6, 7, 8, 9, 10, 11, 12].forEach((idx) => {
            if (savedParticipants[idx] && savedLocations[0]) {
                attendancesData.push({
                    id: crypto.randomUUID(),
                    participantId: savedParticipants[idx].id,
                    locationId: savedLocations[0].id,
                    date: daysAgo(5),
                    time: helperTime(15, 20 + idx),
                    isActive: true,
                });
            }
        });

        // Día 7 - Sede Norte
        [0, 1, 3, 4, 6, 7, 13, 14].forEach((idx) => {
            if (savedParticipants[idx] && savedLocations[1]) {
                attendancesData.push({
                    id: crypto.randomUUID(),
                    participantId: savedParticipants[idx].id,
                    locationId: savedLocations[1].id,
                    date: daysAgo(7),
                    time: helperTime(14, 50 + idx),
                    isActive: true,
                });
            }
        });

        // Día 10 - Sede Sur
        [2, 3, 4, 5, 9, 10, 11, 12, 13].forEach((idx) => {
            if (savedParticipants[idx] && savedLocations[2]) {
                attendancesData.push({
                    id: crypto.randomUUID(),
                    participantId: savedParticipants[idx].id,
                    locationId: savedLocations[2].id,
                    date: daysAgo(10),
                    time: helperTime(15, 15 + idx * 2),
                    isActive: true,
                });
            }
        });

        const savedAttendances = await AttendanceRepo.save(attendancesData);
        console.log(`✅ Seeded ${savedAttendances.length} attendances`);

        // ═══════════════════════════════════════════════════════════
        // RESUMEN FINAL
        // ═══════════════════════════════════════════════════════════
        console.log("\n🎉 Database seeding completed successfully!");
        console.log("📊 Summary:");
        console.log(`   - Admin users: ${savedAdmins.length}`);
        console.log(`   - Locations: ${savedLocations.length}`);
        console.log(`   - Participants: ${savedParticipants.length}`);
        console.log(`   - Attendances: ${savedAttendances.length}`);
        console.log("\n🔐 Admin credentials:");
        console.log(`   Email: nacho@cbj.org`);
        console.log(`   Password: admin123`);

    } catch (error) {
        console.error("❌ Error seeding database:", error);
        throw error;
    }
}

seedDatabase()
    .then(() => {
        console.log("✅ Seed script completed");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Seed script failed:", error);
        process.exit(1);
    });