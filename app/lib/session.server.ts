import { createCookieSessionStorage } from "@remix-run/node";

type SessionData = {
  javascriptEnabled: boolean;
  cssEnabled: boolean;
  analyticsEnabled: boolean;
};

type SessionFlashData = {
  message: string;
  type: "success" | "error" | "info";
};

export const preferences = createCookieSessionStorage<SessionData, SessionFlashData>({
  cookie: {
    name: "__on.me__prefs",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 100 * 365 * 24 * 60 * 60,
  },
});
