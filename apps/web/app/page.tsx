import * as React from "react";

import * as motion from "motion/react-client";
import { cn } from "@/styles/utils";

export default function Page() {
  const variants = {
    initial: { opacity: 0, filter: "blur(8px)" },
    animate: { opacity: 1, filter: "blur(0px)" },
  };

  return (
    <main className="grid min-h-dvh place-items-center">
      <div className="flex flex-col gap-10">
        <motion.div
          className="text-muted-foreground/50 text-3xl font-[450] select-none"
          initial="initial"
          animate="animate"
          transition={{ staggerChildren: 0.18 }}
        >
          {["No more overthinking,", "commit in seconds!"].map((line, i) => (
            <motion.p key={`line-${i}`} className="flex">
              {line.split(" ").map((word, j) => (
                <motion.span
                  key={`word-${j}`}
                  className={cn(
                    i === 1 && j === 0 && "text-secondary-foreground",
                  )}
                  variants={variants}
                  transition={{ duration: 0.8 }}
                >
                  {word}
                  {j < line.split(" ").length - 1 && <span>&nbsp;</span>}
                </motion.span>
              ))}
              {i === 0 && <br />}
            </motion.p>
          ))}
        </motion.div>
        <motion.h1
          className="text-muted-foreground/60 font-mono text-base tracking-tight"
          initial="initial"
          animate="animate"
          variants={variants}
          transition={{ duration: 0.6, delay: 2 }}
        >
          npm install -g&nbsp;
          <span className="text-secondary-foreground">@snelusha/noto</span>
        </motion.h1>
      </div>
    </main>
  );
}
