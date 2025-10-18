import database from "infra/database";
import email from "infra/email.js";
import webserver from "infra/webserver.js";

const EXPIRATION_IN_MILLISECONDS = 60 * 15 * 1000; // 15 minutos

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const newToken = await runInsertQuery(userId, expiresAt);
  return newToken;

  async function runInsertQuery(userId, expiresAt) {
    const result = await database.query({
      text: `
        INSERT INTO
          user_activation_tokens (user_id, expires_at)
        VALUES
          ($1, $2)
        RETURNING
          *
      ;`,
      values: [userId, expiresAt],
    });

    return result.rows[0];
  }
}

async function findOneByUserId(userId) {
  const newToken = await runSelectQuery(userId);
  return newToken;

  async function runSelectQuery(userId) {
    const result = await database.query({
      text: `
        SELECT
          *
        FROM
          user_activation_tokens
        WHERE
          user_id = $1
        LIMIT 1
      ;`,
      values: [userId],
    });

    return result.rows[0];
  }
}

async function sendEmailToUser(user, activationToken) {
  await email.send({
    from: "Okcode <contato@okcode.com.br>",
    to: user.email,
    subject: "Ative seu cadastro no Okcode!",
    text: `Olá, ${user.username}, clique no link abaixo para ativar seu cadastro no Okcode:

${webserver.origin}/cadastro/ativar/${activationToken.id}

Atenciosamente,
Equipe Okcode`,
  });
}

const activation = {
  create,
  sendEmailToUser,
  findOneByUserId,
};

export default activation;
