import email from "infra/email.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.js", () => {
  test("send()", async () => {
    await orchestrator.deleteAllEmails();

    await email.send({
      from: "OkCode <contato@faneto.com.br>",
      to: "contato@okcode.com.br",
      subject: "Teste de assunto para envio de email",
      text: "Teste de corpo para envio de email",
    });

    await email.send({
      from: "OkCode <contato@faneto.com.br>",
      to: "contato@okcode.com.br",
      subject: "Último email enviado",
      text: "Teste de corpo para envCorpo do último email",
    });

    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toBe("<contato@faneto.com.br>");
    expect(lastEmail.recipients[0]).toBe("<contato@okcode.com.br>");
    expect(lastEmail.subject).toBe("Último email enviado");
    expect(lastEmail.text).toBe(
      "Teste de corpo para envCorpo do último email\r\n",
    );
  });
});
