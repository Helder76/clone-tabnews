import { createRouter } from "next-connect";
import database from "infra/database";
import { resolve } from "node:path";
import migrationRunner from "node-pg-migrate";
import controller from "infra/controller";

const router = createRouter();

router.get(getHandle);
router.post(postHandle);

export default router.handler(controller.errorHandlers);

const defaultMigrationOptions = {
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: "pgmigrations",
};

async function getHandle(request, response) {
  let dbClient;
  try {
    const dbClient = await database.getNewClient();
    const pedingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
    });
    response.status(200).json(pedingMigrations);
  } finally {
    await dbClient.end();
  }
}

async function postHandle(request, response) {
  let dbClient;
  try {
    const dbClient = await database.getNewClient();
    const migrateMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dryRun: false,
      dbClient,
    });
    if (migrateMigrations.length > 0) {
      response.status(201).json(migrateMigrations);
    }
    response.status(200).json(migrateMigrations);
  } finally {
    await dbClient.end();
  }
}
