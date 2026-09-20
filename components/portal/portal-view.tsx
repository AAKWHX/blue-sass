"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import {
  CalendarClock,
  CheckCircle2,
  Circle,
  CircleDot,
  Download,
  FileArchive,
  FileSignature,
  FileText,
  Image as ImageIcon,
  Loader2,
  MessageSquare,
  Receipt,
  Send,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { useI18n } from "@/components/providers";
import { ProgressBar, StatusBadge } from "@/components/ui/primitives";
import {
  getProfile,
  projectFeedback,
  projectFiles,
  projectMessages,
  projectMilestones,
  projects,
} from "@/lib/mock-data";
import type { Feedback, FeedbackCategory, FileCategory, ProjectStage } from "@/lib/demo-types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const STAGES: ProjectStage[] = ["planning", "design", "development", "testing", "review"];

const fileIcons: Record<FileCategory, typeof FileText> = {
  design: ImageIcon,
  document: FileText,
  contract: FileSignature,
  source: FileArchive,
  invoice: Receipt,
};

/** The demo client shown when no database is connected. */
const CLIENT_ID = "u-101";

export function PortalView() {
  const { t, locale } = useI18n();
  const clientProjects = useMemo(() => projects.filter((p) => p.client_id === CLIENT_ID), []);
  const [projectId, setProjectId] = useState(clientProjects[0].id);
  const [tab, setTab] = useState<"overview" | "files" | "feedback" | "messages">("overview");

  const project = clientProjects.find((p) => p.id === projectId)!;
  const milestones = projectMilestones(project.id);
  const files = projectFiles(project.id);
  const client = getProfile(CLIENT_ID)!;

  const [feedbackList, setFeedbackList] = useState<Feedback[]>(() => projectFeedback(project.id));
  const [draft, setDraft] = useState("");
  const [category, setCategory] = useState<FeedbackCategory>("design");

  function selectProject(id: string) {
    setProjectId(id);
    setFeedbackList(projectFeedback(id));
  }

  function submitFeedback(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setFeedbackList((prev) => [
      ...prev,
      {
        id: `fb-local-${prev.length + 1}`,
        project_id: project.id,
        author_id: CLIENT_ID,
        category,
        body: draft.trim(),
        resolved: false,
        created_at: new Date().toISOString(),
      },
    ]);
    setDraft("");
  }

  const currentStageIndex = STAGES.indexOf(project.stage === "completed" ? "review" : project.stage);
  const nextMilestone = milestones.find((m) => m.status !== "done");

  return (
    <section className="relative py-12">
      <div className="container-x relative z-content">
        <header className="glass-card flex flex-wrap items-center justify-between gap-5 p-6">
          <div>
            <span className="mono-label rounded-full border border-neon-cyan/30 bg-neon-cyan/[0.06] px-3 py-1.5">{t.portal.title}</span>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-gradient">
              {t.portal.welcome}, {client.full_name}
            </h1>
            <p className="mt-1 text-sm text-ink-low">
              {client.company} · {client.title}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-neon-emerald">
            <ShieldCheck className="h-4 w-4" />
            End-to-end encrypted workspace
          </div>
        </header>

        <div className="mt-5 flex flex-wrap gap-2">
          {clientProjects.map((p) => (
            <Button variant="unstyled" size="auto"
              key={p.id}
              type="button"
              onClick={() => selectProject(p.id)}
              className={clsx(
                "rounded-xl border px-4 py-2.5 text-sm font-semibold transition",
                p.id === projectId
                  ? "border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan shadow-glow-cyan"
                  : "border-line-strong text-ink-low hover:border-neon-cyan/50 hover:text-white",
              )}
            >
              {p.name}
            </Button>
          ))}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <div className="glass-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold">{project.name}</h2>
                <StatusBadge status={project.stage} label={t.status[project.stage]} />
              </div>
              <p className="mt-2 text-sm text-ink-low">{project.summary}</p>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                  <span className="text-ink-low">{t.portal.completion}</span>
                  <span className="tabular-nums text-neon-cyan">{project.progress}%</span>
                </div>
                <ProgressBar value={project.progress} />
              </div>

              <ol className="mt-8 grid gap-3 sm:grid-cols-5">
                {STAGES.map((stage, i) => {
                  const done = i < currentStageIndex || project.stage === "completed";
                  const current = i === currentStageIndex && project.stage !== "completed";
                  return (
                    <li key={stage} className="relative">
                      <div className="flex items-center gap-2">
                        {done ? (
                          <CheckCircle2 className="h-5 w-5 text-neon-emerald" />
                        ) : current ? (
                          <CircleDot className="h-5 w-5 animate-pulse text-neon-cyan" />
                        ) : (
                          <Circle className="h-5 w-5 text-ink-mid" />
                        )}
                        <span
                          className={clsx(
                            "text-xs font-bold",
                            done ? "text-neon-emerald" : current ? "text-neon-cyan" : "text-ink-low",
                          )}
                        >
                          {t.status[stage]}
                        </span>
                      </div>
                      <div className="mt-2 h-1 rounded-full bg-line">
                        <div
                          className={clsx(
                            "h-full rounded-full",
                            done ? "w-full bg-emerald-500" : current ? "w-1/2 bg-cyan-400" : "w-0",
                          )}
                        />
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="contents">
            <div className="glass-card p-2">
              <TabsList>
                {(["overview", "files", "feedback", "messages"] as const).map((key) => (
                  <TabsTrigger key={key} value={key}>
                    {t.portal.tabs[key]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="overview">
              <div className="glass-card p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-ink-low">{t.portal.milestones}</h3>
                <ul className="mt-5 space-y-3">
                  {milestones.map((m) => {
                    const owner = m.assignee_id ? getProfile(m.assignee_id) : null;
                    return (
                      <li
                        key={m.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line p-4"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">{m.title}</p>
                          <p className="mt-1 text-xs text-ink-low">
                            {t.status[m.stage]} · {owner?.full_name ?? "—"} · {m.due_date}
                          </p>
                        </div>
                        <StatusBadge status={m.status} label={t.status[m.status]} />
                      </li>
                    );
                  })}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="files">
              <div className="glass-card p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-ink-low">{t.portal.filesTitle}</h3>
                    <p className="mt-1 text-xs text-ink-low">{t.portal.filesSubtitle}</p>
                  </div>
                  <Button type="button" variant="ghostNeon" className="!py-2 text-xs">
                    <Upload className="h-4 w-4" />
                    {t.common.upload}
                  </Button>
                </div>
                <ul className="mt-5 divide-y divide-line">
                  {files.map((f) => {
                    const Icon = fileIcons[f.category];
                    const uploader = getProfile(f.uploaded_by);
                    return (
                      <li key={f.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-neon-cyan/10 text-neon-cyan">
                            <Icon className="h-5 w-5" />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{f.name}</p>
                            <p className="text-xs text-ink-low">
                              {f.version} · {(f.size_kb / 1024).toFixed(1)} MB · {uploader?.full_name} · {f.created_at}
                            </p>
                          </div>
                        </div>
                        <Button type="button" variant="ghostNeon" className="!px-3 !py-2 text-xs">
                          <Download className="h-4 w-4" />
                          {t.common.download}
                        </Button>
                      </li>
                    );
                  })}
                  {files.length === 0 && <li className="py-6 text-sm text-ink-low">{t.common.empty}</li>}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="feedback">
              <div className="glass-card p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-ink-low">{t.portal.feedbackTitle}</h3>

                <ul className="mt-5 space-y-4">
                  {feedbackList.map((item) => {
                    const author = getProfile(item.author_id);
                    const isClient = item.author_id === CLIENT_ID;
                    return (
                      <li key={item.id} className={clsx("flex gap-3", isClient ? "flex-row-reverse" : "flex-row")}>
                        <Avatar>
                          <AvatarFallback>{(author?.full_name ?? "?").charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div
                          className={clsx(
                            "max-w-xl rounded-2xl border p-4 text-start",
                            isClient
                              ? "border-neon-cyan/30 bg-neon-cyan/10"
                              : "border-line bg-elevated",
                          )}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold">{author?.full_name}</span>
                            <span className="chip !px-2 !py-0.5 !text-[10px]">{t.portal.categories[item.category]}</span>
                            {item.resolved && (
                              <span className="text-[10px] font-bold uppercase text-neon-emerald">✓ {t.status.done}</span>
                            )}
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-ink-mid">{item.body}</p>
                          <p className="mt-2 text-[11px] text-ink-low">
                            {new Date(item.created_at).toLocaleString(locale)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <form onSubmit={submitFeedback} className="mt-6 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {(["design", "content", "bug", "scope"] as FeedbackCategory[]).map((c) => (
                      <Button variant="unstyled" size="auto"
                        key={c}
                        type="button"
                        onClick={() => setCategory(c)}
                        className={clsx(
                          "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                          category === c
                            ? "border-neon-cyan/50 bg-neon-cyan/15 text-white"
                            : "border-line-strong text-ink-low",
                        )}
                      >
                        {t.portal.categories[c]}
                      </Button>
                    ))}
                  </div>
                  <Textarea
                    rows={3}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={t.portal.feedbackPlaceholder}
                    className="field resize-none"
                  />
                  <Button type="submit" variant="neon">
                    <Send className="h-4 w-4 flip-x" />
                    {t.portal.postFeedback}
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="messages">
              <div className="glass-card p-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-ink-low">{t.portal.tabs.messages}</h3>
                <ul className="mt-5 space-y-3">
                  {projectMessages(project.id).map((m) => {
                    const sender = getProfile(m.sender_id);
                    return (
                      <li key={m.id} className="rounded-xl border border-line p-4">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-3.5 w-3.5 text-neon-cyan" />
                          <span className="text-xs font-bold">{sender?.full_name}</span>
                          <span className="text-[11px] text-ink-low">
                            {new Date(m.created_at).toLocaleString(locale)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-ink-mid">{m.body}</p>
                      </li>
                    );
                  })}
                  {projectMessages(project.id).length === 0 && (
                    <li className="py-6 text-sm text-ink-low">{t.common.empty}</li>
                  )}
                </ul>
              </div>
            </TabsContent>
            </Tabs>
          </div>

          <aside className="space-y-5">
            <div className="glass-card p-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-ink-low">{t.portal.nextDelivery}</h3>
              {nextMilestone ? (
                <>
                  <p className="mt-3 text-sm font-semibold">{nextMilestone.title}</p>
                  <p className="mt-2 flex items-center gap-2 text-xs text-ink-low">
                    <CalendarClock className="h-3.5 w-3.5" />
                    {nextMilestone.due_date}
                  </p>
                  <div className="mt-3">
                    <StatusBadge status={nextMilestone.status} label={t.status[nextMilestone.status]} />
                  </div>
                </>
              ) : (
                <p className="mt-3 flex items-center gap-2 text-sm text-neon-emerald">
                  <CheckCircle2 className="h-4 w-4" /> {t.status.completed}
                </p>
              )}
            </div>

            <div className="glass-card p-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-ink-low">{t.common.team}</h3>
              <ul className="mt-4 space-y-3">
                {["u-003", "u-004", "u-005"].map((id) => {
                  const member = getProfile(id)!;
                  return (
                    <li key={id} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{member.full_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">{member.full_name}</p>
                        <p className="text-xs text-ink-low">{member.title}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-ink-low">{t.common.budget}</h3>
              <p className="tabular mt-3 text-2xl font-black text-gradient">
                {new Intl.NumberFormat(locale, { style: "currency", currency: project.currency, maximumFractionDigits: 0 }).format(
                  project.budget,
                )}
              </p>
              <p className="mt-2 flex items-center gap-2 text-xs text-ink-low">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {t.common.deadline}: {project.deadline}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
