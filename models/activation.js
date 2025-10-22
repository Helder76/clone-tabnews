import database from "infra/database";
import email from "infra/email.js";
import webserver from "infra/webserver.js";
import user from "models/user.js";

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

async function findOneValidById(tokenId) {
  const idToken = await runSelectQuery(tokenId);
  return idToken;

  async function runSelectQuery(tokenId) {
    const result = await database.query({
      text: `
        SELECT
          *
        FROM
          user_activation_tokens
        WHERE
          id = $1
          AND expires_at > NOW()
          AND used_at IS NULL
        LIMIT 1
      ;`,
      values: [tokenId],
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

async function markTokenAsUsed(activationTokenId) {
  const usedActivationToken = await runUpdateQuery(activationTokenId);
  return usedActivationToken;

  async function runUpdateQuery(activationTokenId) {
    const result = await database.query({
      text: `
        UPDATE
          user_activation_tokens
        SET
          used_at = timezone('utc', now()),
          updated_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
      ;`,
      values: [activationTokenId],
    });

    return result.rows[0];
  }
}

async function activateUserByUserId(userId) {
  const activatedUser = await user.setFeatures(userId, ["create:sessions"]);
  return activatedUser;
}

const activation = {
  create,
  sendEmailToUser,
  findOneValidById,
  markTokenAsUsed,
  activateUserByUserId,
};

export default activation;
