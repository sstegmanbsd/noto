"use client";

import * as React from "react";

import { Copy, Check } from "lucide-react";

import { cn } from "~/styles/utils";
import { FigmaWrapper } from "./figma-wrapper";

export function InstallCommand() {
  const [copied, setCopied] = React.useState(false);

  const command = "npm install -g @snelusha/noto";

  const handleCopy = () => {
    navigator.clipboard
      .writeText(command)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  };

  return (
    <FigmaWrapper>
      <h1
        className="text-muted-foreground/60 group relative inline-flex w-full cursor-pointer items-center p-2 pr-8 font-mono text-sm tracking-tight"
        onClick={handleCopy}
      >
        npm install -g&nbsp;
        <span className="text-secondary-foreground">@snelusha/noto</span>
        <span
          className={cn(
            !copied && "opacity-0",
            "absolute right-2 ml-4 inline-flex items-center transition-opacity group-hover:opacity-100",
          )}
        >
          <div
            className={cn(
              "inset-0 transform transition-all duration-300",
              copied ? "scale-0 opacity-0" : "scale-100 opacity-100",
            )}
          >
            <Copy className="text-muted-foreground/50 size-4" />
          </div>
          <div
            className={cn(
              "absolute transform transition-all duration-300",
              copied ? "scale-100 opacity-100" : "scale-0 opacity-0",
            )}
          >
            <Check className="text-muted-foreground/50 size-4" />
          </div>
        </span>
      </h1>
    </FigmaWrapper>
  );
}
