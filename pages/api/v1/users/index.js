import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import user from "models/user.js";

const router = createRouter();

router.post(postHandle);

export default router.handler(controller.errorHandlers);

async function postHandle(request, response) {
  const userInputValues = request.body;
  const newUser = await user.create(userInputValues);
  return response.status(201).json(newUser);
}
