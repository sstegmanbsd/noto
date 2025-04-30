"use client";

import * as React from "react";

import Link from "next/link";

import { cn } from "@/styles/utils";

const COOKIE_NAME = "github-stars";
const ONE_HOUR = 60 * 60 * 1000;

const formatStars = (count: number | null) => {
  if (!count) return null;
  return count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count;
};

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() ?? null;
  return null;
};

const setCookie = (name: string, value: string) => {
  const expires = new Date(Date.now() + ONE_HOUR).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
};

export function GithubStars() {
  const [stars, setStars] = React.useState<number | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    async function fetchStars() {
      const cachedStars = getCookie(COOKIE_NAME);

      if (cachedStars) {
        setStars(Number.parseInt(cachedStars, 10));
        setIsLoaded(true);
        return;
      }

      try {
        const response = await fetch(
          "https://api.github.com/repos/snelusha/noto",
        );
        const data = (await response.json()) as { stargazers_count: number };
        setStars(data.stargazers_count);
        setCookie(COOKIE_NAME, data.stargazers_count.toString());
        setIsLoaded(true);
      } catch {}
    }

    fetchStars();
  }, []);

  return (
    <Link
      className="group outline-none"
      href="https://github.com/snelusha/noto"
    >
      <div
        className={cn(
          "text-muted-foreground/80 flex items-center gap-2 font-mono transition-opacity duration-300 select-none group-hover:underline md:text-sm",
          isLoaded ? "opacity-100" : "opacity-0",
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          fill="none"
          className="size-4"
        >
          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
          <path d="m9 18c-4.51 2-5-2-7-2" />
        </svg>
        {formatStars(stars)}
      </div>
    </Link>
  );
}
