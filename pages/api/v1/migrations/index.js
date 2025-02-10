import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import migrator from "models/migrator.js";

const router = createRouter();

router.get(getHandle);
router.post(postHandle);

export default router.handler(controller.errorHandlers);

async function getHandle(request, response) {
  const pedingMigrations = await migrator.listPendingMigrations();
  return response.status(200).json(pedingMigrations);
}

async function postHandle(request, response) {
  const migrateMigrations = await migrator.runPendingMigrations();
  if (migrateMigrations.length > 0) {
    return response.status(201).json(migrateMigrations);
  }
  return response.status(200).json(migrateMigrations);
}
