import { http, HttpResponse } from "msw";

export const handlers = [
  http.post("/api/auth/login", async () => {
    return HttpResponse.json({ token: "mock.jwt.token" }, { status: 200 });
  })
];

