import authorization from "models/authorization.js";
import { InternalServerError } from "infra/errors.js";
import email from "infra/email";

describe("models/authorization.js", () => {
  describe(".can()", () => {
    test("without `user`", () => {
      expect(() => {
        authorization.can();
      }).toThrow(InternalServerError);
    });

    test("without `user.features`", () => {
      const createdUser = {
        username: "UserWithoutFeatures",
      };
      expect(() => {
        authorization.can(createdUser);
      }).toThrow(InternalServerError);
    });

    test("with unknown `feature`", () => {
      const createdUser = {
        features: [],
      };
      expect(() => {
        authorization.can(createdUser, "unknown:feature");
      }).toThrow(InternalServerError);
    });

    test("with valid user and known `feature`", () => {
      const createdUser = {
        features: ["create:user"],
      };
      expect(authorization.can(createdUser, "create:user")).toBe(true);
    });
  });

  describe(".filterOutput()", () => {
    test("without `user`", () => {
      expect(() => {
        authorization.filterOutput();
      }).toThrow(InternalServerError);
    });

    test("without `user.features`", () => {
      const createdUser = {
        username: "UserWithoutFeatures",
      };
      expect(() => {
        authorization.filterOutput(createdUser);
      }).toThrow(InternalServerError);
    });

    test("with unknown `feature`", () => {
      const createdUser = {
        features: [],
      };
      expect(() => {
        authorization.filterOutput(createdUser, "unknown:feature");
      }).toThrow(InternalServerError);
    });

    test("with valid user, known `feature` and resource", () => {
      const createdUser = {
        features: ["read:user"],
      };

      const resource = {
        id: 1,
        username: "resourceUser",
        features: ["create:user"],
        created_at: "2026-02-09T17:11:00Z",
        updated_at: "2026-02-09T00:00:00Z",
        email: "resource@resource.com",
        password: "resourcePassword",
      };

      const result = authorization.filterOutput(
        createdUser,
        "read:user",
        resource,
      );

      expect(result).toEqual({
        id: 1,
        username: "resourceUser",
        features: ["create:user"],
        created_at: "2026-02-09T17:11:00Z",
        updated_at: "2026-02-09T00:00:00Z",
      });
    });

    test("with valid `user`, know `feature` but no `resorce`", () => {
      const createdUser = {
        features: ["read:user"],
      };

      expect(() => {
        authorization.filterOutput(createdUser, "read:user");
      }).toThrow(InternalServerError);
    });
  });
});
