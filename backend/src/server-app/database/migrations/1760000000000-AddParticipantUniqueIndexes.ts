import type { MigrationInterface, QueryRunner } from "typeorm";

export class AddParticipantUniqueIndexes1760000000000 implements MigrationInterface {
  name = "AddParticipantUniqueIndexes1760000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const duplicateDocuments: unknown[] = await queryRunner.query(`
      SELECT "documentNumber", "locationId", COUNT(*)
      FROM "participants"
      GROUP BY "documentNumber", "locationId"
      HAVING COUNT(*) > 1
      LIMIT 1
    `);

    if (duplicateDocuments.length > 0) {
      throw new Error(
        "No se pueden crear los índices de participantes: existen documentos duplicados por sede",
      );
    }

    const duplicateEmails: unknown[] = await queryRunner.query(`
      SELECT "email", "locationId", COUNT(*)
      FROM "participants"
      WHERE "email" IS NOT NULL
      GROUP BY "email", "locationId"
      HAVING COUNT(*) > 1
      LIMIT 1
    `);

    if (duplicateEmails.length > 0) {
      throw new Error(
        "No se pueden crear los índices de participantes: existen emails duplicados por sede",
      );
    }

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_participants_document_location"
      ON "participants" ("documentNumber", "locationId")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_participants_email_location"
      ON "participants" ("email", "locationId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX IF EXISTS "UQ_participants_email_location"',
    );
    await queryRunner.query(
      'DROP INDEX IF EXISTS "UQ_participants_document_location"',
    );
  }
}
