import type { QueryRunner } from "typeorm";
import { describe, expect, it, vi } from "vitest";
import { AddParticipantUniqueIndexes1760000000000 } from "../1760000000000-AddParticipantUniqueIndexes.js";

const queryRunnerWith = (...results: unknown[]) => {
  const query = vi.fn();
  results.forEach((result) => query.mockResolvedValueOnce(result));
  return { query } as unknown as QueryRunner;
};

describe("AddParticipantUniqueIndexes1760000000000", () => {
  it("verifica duplicados antes de crear ambos índices", async () => {
    const queryRunner = queryRunnerWith([], [], undefined, undefined);
    const migration = new AddParticipantUniqueIndexes1760000000000();

    await migration.up(queryRunner);

    const queries = vi.mocked(queryRunner.query).mock.calls.map(([sql]) => String(sql));
    expect(queries[0]).toContain('GROUP BY "documentNumber", "locationId"');
    expect(queries[1]).toContain('GROUP BY "email", "locationId"');
    expect(queries[2]).toContain('CREATE UNIQUE INDEX "UQ_participants_document_location"');
    expect(queries[3]).toContain('CREATE UNIQUE INDEX "UQ_participants_email_location"');
  });

  it("aborta sin crear índices cuando hay documentos duplicados", async () => {
    const queryRunner = queryRunnerWith([{ documentNumber: "123", locationId: "location-1" }]);
    const migration = new AddParticipantUniqueIndexes1760000000000();

    await expect(migration.up(queryRunner)).rejects.toThrow("documentos duplicados");
    expect(queryRunner.query).toHaveBeenCalledTimes(1);
  });

  it("aborta sin crear índices cuando hay emails duplicados", async () => {
    const queryRunner = queryRunnerWith([], [{ email: "a@example.com", locationId: "location-1" }]);
    const migration = new AddParticipantUniqueIndexes1760000000000();

    await expect(migration.up(queryRunner)).rejects.toThrow("emails duplicados");
    expect(queryRunner.query).toHaveBeenCalledTimes(2);
  });

  it("revierte ambos índices", async () => {
    const queryRunner = queryRunnerWith(undefined, undefined);
    const migration = new AddParticipantUniqueIndexes1760000000000();

    await migration.down(queryRunner);

    const queries = vi.mocked(queryRunner.query).mock.calls.map(([sql]) => String(sql));
    expect(queries[0]).toContain('DROP INDEX IF EXISTS "UQ_participants_email_location"');
    expect(queries[1]).toContain('DROP INDEX IF EXISTS "UQ_participants_document_location"');
  });
});
