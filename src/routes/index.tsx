import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import JSZip from "jszip";
import {
  Package,
  Palette,
  Database,
  Boxes,
  FileCode2,
  ShieldCheck,
  Wrench,
  Download,
  FolderTree,
  Folder,
  FileText,
  Sparkles,
  Check,
} from "lucide-react";
import {
  buildFiles,
  buildTree,
  defaultConfig,
  type Config,
  type TreeNode,
} from "@/lib/scaffolder";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [cfg, setCfg] = useState<Config>(defaultConfig);
  const [generating, setGenerating] = useState(false);

  const files = useMemo(() => buildFiles(cfg), [cfg]);
  const tree = useMemo(() => buildTree(files), [files]);
  const fileCount = Object.keys(files).length;

  const update = <K extends keyof Config>(key: K, value: Config[K]) =>
    setCfg((c) => ({ ...c, [key]: value }));

  async function generate() {
    setGenerating(true);
    try {
      const zip = new JSZip();
      for (const [path, content] of Object.entries(files)) {
        zip.file(path, content);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${cfg.projectName || "my-app"}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <header className="border-b border-border/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[image:var(--gradient-primary)] shadow-[var(--shadow-glow)]">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight">StackGen</div>
              <div className="-mt-0.5 text-[11px] uppercase tracking-widest text-muted-foreground">
                Next.js scaffolder
              </div>
            </div>
          </div>
          <a
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Next.js docs ↗
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10 max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Ship your Next.js{" "}
            <span className="bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
              starter
            </span>{" "}
            in seconds.
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            Pick your stack, watch the file tree update live, and download a
            ready-to-run ZIP. No boilerplate, no wiring.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <section className="space-y-6">
            <ProjectNameCard cfg={cfg} update={update} />

            <Group
              icon={<Palette className="h-4 w-4" />}
              title="Styling"
              subtitle="Tailwind CSS is included by default."
            >
              <ToggleCard
                label="Shadcn UI"
                desc="Beautiful component primitives on top of Tailwind."
                checked={cfg.shadcn}
                onChange={(v) => update("shadcn", v)}
              />
            </Group>

            <Group icon={<Database className="h-4 w-4" />} title="Data fetching">
              <OptionCard
                label="TanStack Query"
                desc="React Query with a wired-up QueryProvider."
                selected={cfg.dataFetching === "tanstack"}
                onClick={() => update("dataFetching", "tanstack")}
              />
              <OptionCard
                label="Native fetch"
                desc="No dependency. Server components + fetch()."
                selected={cfg.dataFetching === "fetch"}
                onClick={() => update("dataFetching", "fetch")}
              />
            </Group>

            <Group icon={<Boxes className="h-4 w-4" />} title="State management">
              <OptionCard
                label="Zustand"
                desc="Tiny, hook-based store."
                selected={cfg.stateManagement === "zustand"}
                onClick={() => update("stateManagement", "zustand")}
              />
              <OptionCard
                label="Jotai"
                desc="Primitive & flexible atomic state."
                selected={cfg.stateManagement === "jotai"}
                onClick={() => update("stateManagement", "jotai")}
              />
              <OptionCard
                label="React Context"
                desc="Zero-dep provider scaffold."
                selected={cfg.stateManagement === "context"}
                onClick={() => update("stateManagement", "context")}
              />
              <OptionCard
                label="None"
                desc="Skip state management."
                selected={cfg.stateManagement === "none"}
                onClick={() => update("stateManagement", "none")}
              />
            </Group>

            <Group icon={<FileCode2 className="h-4 w-4" />} title="Forms">
              <ToggleCard
                label="React Hook Form + Zod"
                desc="Typed forms with schema validation."
                checked={cfg.forms}
                onChange={(v) => update("forms", v)}
              />
            </Group>

            <Group icon={<Wrench className="h-4 w-4" />} title="Code quality">
              <ToggleCard
                label="Prettier"
                desc="Opinionated code formatting."
                checked={cfg.prettier}
                onChange={(v) => update("prettier", v)}
              />
              <ToggleCard
                label="ESLint"
                desc="Next.js recommended lint config."
                checked={cfg.eslint}
                onChange={(v) => update("eslint", v)}
              />
              <ToggleCard
                label="Husky + lint-staged"
                desc="Pre-commit hooks that keep main clean."
                checked={cfg.husky}
                onChange={(v) => update("husky", v)}
              />
            </Group>

            <Group icon={<ShieldCheck className="h-4 w-4" />} title="Authentication">
              <OptionCard
                label="NextAuth (Auth.js)"
                desc="Handlers + session helpers scaffolded."
                selected={cfg.auth === "nextauth"}
                onClick={() => update("auth", "nextauth")}
              />
              <OptionCard
                label="None"
                desc="Add auth later."
                selected={cfg.auth === "none"}
                onClick={() => update("auth", "none")}
              />
            </Group>
          </section>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FolderTree className="h-4 w-4 text-primary" />
                  File tree
                </div>
                <span className="text-xs text-muted-foreground">
                  {fileCount} files
                </span>
              </div>
              <div className="max-h-[420px] overflow-auto p-3 font-mono text-[13px]">
                <div className="flex items-center gap-1.5 py-0.5 text-foreground/90">
                  <Folder className="h-3.5 w-3.5 text-primary" />
                  <span>{cfg.projectName || "my-app"}/</span>
                </div>
                <Tree node={tree} depth={1} />
              </div>
              <div className="border-t border-border/60 bg-background/40 p-5">
                <button
                  onClick={generate}
                  disabled={generating}
                  className="group flex w-full items-center justify-center gap-2 rounded-lg bg-[image:var(--gradient-primary)] px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:brightness-110 disabled:opacity-60"
                >
                  <Download className="h-4 w-4 transition group-hover:-translate-y-0.5" />
                  {generating ? "Generating…" : "Generate Project"}
                </button>
                <p className="mt-2.5 text-center text-[11px] text-muted-foreground">
                  Downloads {cfg.projectName || "my-app"}.zip · runs client-side
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        Built for developers who'd rather ship than scaffold.
      </footer>
    </div>
  );
}

function ProjectNameCard({
  cfg,
  update,
}: {
  cfg: Config;
  update: <K extends keyof Config>(k: K, v: Config[K]) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        <Package className="h-4 w-4" />
        Project
      </div>
      <label className="block text-sm text-muted-foreground">Project name</label>
      <input
        value={cfg.projectName}
        onChange={(e) =>
          update(
            "projectName",
            e.target.value.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase(),
          )
        }
        className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 font-mono text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
        placeholder="my-app"
      />
    </div>
  );
}

function Group({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-baseline gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {icon}
          {title}
        </div>
        {subtitle && (
          <div className="text-xs text-muted-foreground/70">{subtitle}</div>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function OptionCard({
  label,
  desc,
  selected,
  onClick,
}: {
  label: string;
  desc: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative rounded-xl border p-4 text-left transition ${
        selected
          ? "border-primary bg-primary/10 shadow-[var(--shadow-glow)]"
          : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-medium">{label}</div>
        <div
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
            selected ? "border-primary bg-primary" : "border-border"
          }`}
        >
          {selected && <Check className="h-3 w-3 text-primary-foreground" />}
        </div>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
    </button>
  );
}

function ToggleCard({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`group relative rounded-xl border p-4 text-left transition ${
        checked
          ? "border-primary bg-primary/10 shadow-[var(--shadow-glow)]"
          : "border-border bg-card hover:border-primary/50 hover:bg-card/80"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-medium">{label}</div>
        <div
          className={`flex h-5 w-9 items-center rounded-full px-0.5 transition ${
            checked ? "bg-primary" : "bg-muted"
          }`}
        >
          <div
            className={`h-4 w-4 rounded-full bg-background shadow transition ${
              checked ? "translate-x-4" : ""
            }`}
          />
        </div>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
    </button>
  );
}

function Tree({ node, depth }: { node: TreeNode; depth: number }) {
  if (!node.children) return null;
  return (
    <div>
      {node.children.map((child) => (
        <div key={child.name}>
          <div
            className="flex items-center gap-1.5 py-0.5 text-foreground/80 hover:text-foreground"
            style={{ paddingLeft: `${depth * 14}px` }}
          >
            {child.children ? (
              <>
                <Folder className="h-3.5 w-3.5 shrink-0 text-primary/80" />
                <span>{child.name}/</span>
              </>
            ) : (
              <>
                <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span>{child.name}</span>
              </>
            )}
          </div>
          {child.children && <Tree node={child} depth={depth + 1} />}
        </div>
      ))}
    </div>
   );
}
    </div>
  );
}
