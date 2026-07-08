export type Config = {
  projectName: string;
  shadcn: boolean;
  dataFetching: "tanstack" | "fetch";
  stateManagement: "zustand" | "jotai" | "context" | "none";
  forms: boolean;
  prettier: boolean;
  eslint: boolean;
  husky: boolean;
  auth: "nextauth" | "none";
};

export const defaultConfig: Config = {
  projectName: "my-app",
  shadcn: false,
  dataFetching: "fetch",
  stateManagement: "none",
  forms: false,
  prettier: true,
  eslint: true,
  husky: false,
  auth: "none",
};

type FileMap = Record<string, string>;

export function buildFiles(cfg: Config): FileMap {
  const files: FileMap = {};
  const deps: Record<string, string> = {
    next: "15.0.0",
    react: "19.0.0",
    "react-dom": "19.0.0",
  };
  const devDeps: Record<string, string> = {
    typescript: "^5",
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    tailwindcss: "^4",
    "@tailwindcss/postcss": "^4",
    postcss: "^8",
  };
  const scripts: Record<string, string> = {
    dev: "next dev",
    build: "next build",
    start: "next start",
  };

  if (cfg.shadcn) {
    deps["class-variance-authority"] = "^0.7.0";
    deps["clsx"] = "^2.1.0";
    deps["tailwind-merge"] = "^2.5.0";
    deps["lucide-react"] = "^0.454.0";
  }
  if (cfg.dataFetching === "tanstack") deps["@tanstack/react-query"] = "^5.59.0";
  if (cfg.stateManagement === "zustand") deps["zustand"] = "^5.0.0";
  if (cfg.stateManagement === "jotai") deps["jotai"] = "^2.10.0";
  if (cfg.forms) {
    deps["react-hook-form"] = "^7.53.0";
    deps["zod"] = "^3.23.0";
    deps["@hookform/resolvers"] = "^3.9.0";
  }
  if (cfg.prettier) {
    devDeps["prettier"] = "^3.3.0";
    devDeps["prettier-plugin-tailwindcss"] = "^0.6.0";
    scripts["format"] = "prettier --write .";
  }
  if (cfg.eslint) {
    devDeps["eslint"] = "^9";
    devDeps["eslint-config-next"] = "15.0.0";
    scripts["lint"] = "next lint";
  }
  if (cfg.husky) {
    devDeps["husky"] = "^9.1.0";
    devDeps["lint-staged"] = "^15.2.0";
    scripts["prepare"] = "husky";
  }
  if (cfg.auth === "nextauth") {
    deps["next-auth"] = "^5.0.0-beta.20";
  }

  const sortObj = (o: Record<string, string>) =>
    Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));

  files["package.json"] = JSON.stringify(
    {
      name: cfg.projectName,
      version: "0.1.0",
      private: true,
      scripts,
      dependencies: sortObj(deps),
      devDependencies: sortObj(devDeps),
      ...(cfg.husky
        ? { "lint-staged": { "*.{ts,tsx,js,jsx}": ["prettier --write"] } }
        : {}),
    },
    null,
    2,
  );

  files["README.md"] = `# ${cfg.projectName}

Generated with **StackGen** — a Next.js project scaffolder.

## Getting started

\`\`\`bash
pnpm install
pnpm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- \`pnpm run dev\` — start the dev server
- \`pnpm run build\` — production build
- \`pnpm run start\` — start production server
${cfg.eslint ? "- `pnpm run lint` — run ESLint\n" : ""}${cfg.prettier ? "- `pnpm run format` — run Prettier\n" : ""}
## Included

- Next.js 15 (App Router)
- Tailwind CSS
${cfg.shadcn ? "- Shadcn UI primitives\n" : ""}${cfg.dataFetching === "tanstack" ? "- TanStack Query\n" : ""}${cfg.stateManagement !== "none" ? `- State: ${cfg.stateManagement}\n` : ""}${cfg.forms ? "- React Hook Form + Zod\n" : ""}${cfg.auth === "nextauth" ? "- NextAuth (Auth.js)\n" : ""}`;

  files["tsconfig.json"] = JSON.stringify(
    {
      compilerOptions: {
        target: "ES2022",
        lib: ["dom", "dom.iterable", "esnext"],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        incremental: true,
        plugins: [{ name: "next" }],
        paths: { "@/*": ["./src/*"] },
      },
      include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
      exclude: ["node_modules"],
    },
    null,
    2,
  );

  files["next.config.mjs"] = `/** @type {import('next').NextConfig} */
const nextConfig = {};
export default nextConfig;
`;

  files["postcss.config.mjs"] = `export default { plugins: { "@tailwindcss/postcss": {} } };\n`;

  files["src/app/globals.css"] = `@import "tailwindcss";\n\n:root {\n  --background: #ffffff;\n  --foreground: #171717;\n}\n\nbody {\n  background: var(--background);\n  color: var(--foreground);\n  font-family: system-ui, sans-serif;\n}\n`;

  // Providers
  const providerImports: string[] = [];
  const providerOpen: string[] = [];
  const providerClose: string[] = [];

  if (cfg.dataFetching === "tanstack") {
    files["src/app/providers/QueryProvider.tsx"] = `"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
`;
    providerImports.push(`import { QueryProvider } from "./providers/QueryProvider";`);
    providerOpen.push("<QueryProvider>");
    providerClose.unshift("</QueryProvider>");
  }

  if (cfg.stateManagement === "jotai") {
    files["src/app/providers/JotaiProvider.tsx"] = `"use client";
import { Provider } from "jotai";
import type { ReactNode } from "react";
export function JotaiProvider({ children }: { children: ReactNode }) {
  return <Provider>{children}</Provider>;
}
`;
    providerImports.push(`import { JotaiProvider } from "./providers/JotaiProvider";`);
    providerOpen.push("<JotaiProvider>");
    providerClose.unshift("</JotaiProvider>");
  }

  if (cfg.stateManagement === "context") {
    files["src/app/providers/AppContext.tsx"] = `"use client";
import { createContext, useContext, useState, type ReactNode } from "react";

type AppState = { count: number; setCount: (n: number) => void };
const AppCtx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);
  return <AppCtx.Provider value={{ count, setCount }}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
`;
    providerImports.push(`import { AppProvider } from "./providers/AppContext";`);
    providerOpen.push("<AppProvider>");
    providerClose.unshift("</AppProvider>");
  }

  if (cfg.stateManagement === "zustand") {
    files["src/stores/useAppStore.ts"] = `import { create } from "zustand";

type AppStore = { count: number; increment: () => void };

export const useAppStore = create<AppStore>((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
}));
`;
  }

  const body =
    providerOpen.length > 0
      ? `        ${providerOpen.join("")}{children}${providerClose.join("")}`
      : `        {children}`;

  files["src/app/layout.tsx"] = `import type { Metadata } from "next";
import "./globals.css";
${providerImports.join("\n")}

export const metadata: Metadata = {
  title: "${cfg.projectName}",
  description: "Generated by StackGen",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
${body}
      </body>
    </html>
  );
}
`;

  files["src/app/page.tsx"] = `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold">Welcome to ${cfg.projectName}</h1>
      <p className="mt-4 text-gray-500">Scaffolded with StackGen.</p>
    </main>
  );
}
`;

  if (cfg.forms) {
    files["src/components/ExampleForm.tsx"] = `"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });
type FormValues = z.infer<typeof schema>;

export function ExampleForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
  return (
    <form onSubmit={handleSubmit((v) => console.log(v))} className="space-y-2">
      <input {...register("email")} className="border p-2" placeholder="Email" />
      {errors.email && <p className="text-red-500">{errors.email.message}</p>}
      <button type="submit" className="rounded bg-black px-4 py-2 text-white">Submit</button>
    </form>
  );
}
`;
  }

  if (cfg.shadcn) {
    files["src/lib/utils.ts"] = `import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
`;
    files["components.json"] = JSON.stringify(
      {
        $schema: "https://ui.shadcn.com/schema.json",
        style: "new-york",
        rsc: true,
        tsx: true,
        tailwind: { css: "src/app/globals.css", baseColor: "neutral", cssVariables: true },
        aliases: { components: "@/components", utils: "@/lib/utils" },
      },
      null,
      2,
    );
  }

  if (cfg.auth === "nextauth") {
    files["src/auth.ts"] = `import NextAuth from "next-auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [],
});
`;
    files["src/app/api/auth/[...nextauth]/route.ts"] = `export { GET, POST } from "@/auth";\n`;
  }

  if (cfg.prettier) {
    files[".prettierrc"] = JSON.stringify(
      { semi: true, singleQuote: false, plugins: ["prettier-plugin-tailwindcss"] },
      null,
      2,
    );
  }
  if (cfg.eslint) {
    files["eslint.config.mjs"] = `import next from "eslint-config-next";
export default [...next()];
`;
  }
  if (cfg.husky) {
    files[".husky/pre-commit"] = `bunx lint-staged\n`;
  }

  files[".gitignore"] = `node_modules\n.next\n.env*.local\n.DS_Store\n`;

  return files;
}

export type TreeNode = { name: string; children?: TreeNode[] };

export function buildTree(files: FileMap): TreeNode {
  const root: TreeNode = { name: "", children: [] };
  for (const path of Object.keys(files).sort()) {
    const parts = path.split("/");
    let node = root;
    parts.forEach((part, i) => {
      node.children ||= [];
      let child = node.children.find((c) => c.name === part);
      if (!child) {
        child = { name: part, ...(i < parts.length - 1 ? { children: [] } : {}) };
        node.children.push(child);
      }
      node = child;
    });
  }
  // sort: folders first
  const sort = (n: TreeNode) => {
    if (!n.children) return;
    n.children.sort((a, b) => {
      const af = !!a.children, bf = !!b.children;
      if (af !== bf) return af ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    n.children.forEach(sort);
  };
  sort(root);
  return root;
}