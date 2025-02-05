export default function Page() {
  return (
    <main className="grid min-h-dvh place-items-center">
      <div>
        <h1 className="text-muted-foreground font-mono text-base">
          git(main): x npm install -g <span className="text-secondary-foreground">@snelusha/noto</span>
        </h1>
      </div>
      <footer className="fixed inset-x-0 bottom-4 flex items-center justify-center">
        <p className="text-muted-foreground">
          Made by a&nbsp;
          <span className="text-secondary-foreground">human</span>
          &nbsp;on earth!
        </p>
      </footer>
    </main>
  );
}
