import { test, expect } from "@playwright/test";
const base = "http://127.0.0.1:3002";
test("private server authenticates, guards mutations, redacts secrets and revokes sessions", async ({
  request,
}) => {
  expect((await request.get(base + "/api/library")).status()).toBe(401);
  const headers = {
    "X-Ghost-Writer": "1",
    Origin: "https://studio.example.test",
  };
  expect(
    (
      await request.post(base + "/api/login", {
        headers,
        data: { password: "not-the-password" },
      })
    ).status(),
  ).toBe(401);
  expect(
    (
      await request.post(base + "/api/login", {
        headers: { ...headers, Origin: "https://attacker.example" },
        data: { password: "synthetic-auth-test-password" },
      })
    ).status(),
  ).toBe(403);
  const login = await request.post(base + "/api/login", {
    headers,
    data: { password: "synthetic-auth-test-password" },
  });
  expect(login.status()).toBe(200);
  const cookie = login.headers()["set-cookie"];
  expect(cookie).toContain("HttpOnly");
  expect(cookie).toContain("Secure");
  expect(cookie).toContain("SameSite=Strict");
  const authHeaders = { ...headers, Cookie: cookie.split(";")[0] };
  expect(
    (
      await request.get(base + "/api/library", { headers: authHeaders })
    ).status(),
  ).toBe(200);
  const settings = await request.get(base + "/api/settings", {
    headers: authHeaders,
  });
  const raw = await settings.text();
  expect(raw).not.toContain("synthetic-auth-test-password");
  expect(JSON.parse(raw).ready).toBe(false);
  const backup = await request.get(base + "/api/backup", {
    headers: authHeaders,
  });
  expect(await backup.text()).not.toContain("synthetic-auth-test-password");
  expect(
    (
      await request.post(base + "/api/logout", {
        headers: authHeaders,
        data: {},
      })
    ).status(),
  ).toBe(200);
  expect(
    (
      await request.get(base + "/api/library", { headers: authHeaders })
    ).status(),
  ).toBe(401);
});
