"use client";
import { localizeForLocale } from "@/lib/i18n/extra-locales";
import { withExtraLocales } from "@/lib/i18n/extra-locales";

/**
 * The signed-in client's dashboard.
 *
 * Everything here is real data loaded from Neon by the server component in
 * `app/[locale]/portal/page.tsx`. Writes go through server actions, so the
 * client never touches the database directly.
 */
import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import {
  CalendarClock,
  CheckCircle2,
  Circle,
  CircleDot,
  Clock3,
  ExternalLink,
  FileText,
  Hourglass,
  Loader2,
  MonitorPlay,
  PackageCheck,
  ReceiptText,
  Send,
} from "lucide-react";
import { useI18n } from "@/components/providers";
import { ProgressBar, StatusBadge } from "@/components/ui/primitives";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { builderCopy, translated } from "@/lib/i18n/project-builder";
import {
  postFeedbackAction,
  postMessageAction,
  type MutationState,
} from "@/app/actions/projects";
import type {
  FeedbackRow,
  MessageRow,
  Milestone,
  Project,
  ProjectFile,
  ProjectStage,
  Lead,
  PaymentStatus,
} from "@/lib/db/schema";

const STAGES: ProjectStage[] = ["planning", "design", "development", "testing", "review", "completed"];
const initialState: MutationState = { ok: false, message: "" };
const awaitingCopy = translated("بانتظار الدفع، لن يبدأ التنفيذ قبل تأكيده", "Awaiting payment; work starts after confirmation", "Wacht op betaling; uitvoering start na bevestiging", "Wartet auf Zahlung; Umsetzung nach Bestätigung", "Ödeme bekleniyor; onaydan sonra çalışma başlar", "En attente de paiement ; démarrage après confirmation", "Pendiente de pago; trabajo tras confirmación");
const completedCopy = translated("إطلاق النسخة المعتمدة وتسليم الملفات النهائية", "Launch the approved version and hand over final files", "Goedgekeurde versie lanceren en definitieve bestanden overdragen", "Freigegebene Version starten und finale Dateien übergeben", "Onaylı sürümü yayınlama ve son dosyaları teslim etme", "Lancer la version approuvée et livrer les fichiers finaux", "Publicar la versión aprobada y entregar los archivos finales");
const detailCopy = withExtraLocales({
  ar: { details: "تفاصيل المشروع", budget: "الميزانية", start: "تاريخ البدء", deadline: "موعد التسليم" },
  en: { details: "Project details", budget: "Budget", start: "Start date", deadline: "Deadline" },
  nl: { details: "Projectdetails", budget: "Budget", start: "Startdatum", deadline: "Deadline" },
  de: { details: "Projektdetails", budget: "Budget", start: "Startdatum", deadline: "Abgabetermin" },
  tr: { details: "Proje ayrıntıları", budget: "Bütçe", start: "Başlangıç", deadline: "Teslim tarihi" },
  fr: { details: "Détails du projet", budget: "Budget", start: "Début", deadline: "Échéance" },
  es: { details: "Detalles del proyecto", budget: "Presupuesto", start: "Inicio", deadline: "Entrega" },
} as const);

export interface DashboardProject {
  project: Project;
  milestones: Milestone[];
  files: ProjectFile[];
  feedback: FeedbackRow[];
  messages: MessageRow[];
  summary: {
    total: number;
    done: number;
    percent: number;
    remainingHours: number;
    daysLeft: number | null;
  };
  paymentStatus?: PaymentStatus | null;
  cancelled?: boolean;
}

export interface ClientDashboardProps {
  viewerName: string;
  viewerCompany: string | null;
  projects: DashboardProject[];
  orders: Lead[];
}

function MediaCard({ file }: { file: ProjectFile }) {
  const { locale } = useI18n();
  const liveDemo = locale === "ar" ? "عرض مباشر" : locale === "nl" ? "Live demonstratie" : locale === "de" ? "Live-Demo" : locale === "tr" ? "Canlı demo" : locale === "fr" ? "Démo en direct" : locale === "es" ? "Demostración en vivo" : localizeForLocale("Live demo", locale);
  if (file.kind === "image") {
    return (
      <figure className="overflow-hidden rounded-xl border border-line-strong bg-black/30">
        <div className="relative aspect-video">
          <Image
            src={file.url}
            alt={file.name}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover"
            unoptimized
          />
        </div>
        <figcaption className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
          <span className="truncate font-semibold text-ink-hi" dir="auto">
            {file.name}
          </span>
          <Badge variant="outline">{file.version}</Badge>
        </figcaption>
      </figure>
    );
  }

  if (file.kind === "video") {
    return (
      <figure className="overflow-hidden rounded-xl border border-line-strong bg-black/30">
        <video src={file.url} controls preload="metadata" className="aspect-video w-full" />
        <figcaption className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-ink-hi">
          <MonitorPlay className="size-3.5 shrink-0 text-neon-cyan" />
          <span className="truncate" dir="auto">
            {file.name}
          </span>
        </figcaption>
      </figure>
    );
  }

  const Icon = file.kind === "demo" ? ExternalLink : FileText;
  return (
    <a
      href={file.url}
      target="_blank"
      rel="noreferrer noopener"
      className="flex items-center gap-3 rounded-xl border border-line-strong bg-white/[0.02] p-4 transition hover:border-neon-cyan/50"
    >
      <Icon className="size-5 shrink-0 text-neon-cyan" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-ink-hi" dir="auto">
          {file.name}
        </span>
        <span className="block text-xs text-ink-low">
          {file.kind === "demo" ? liveDemo : `${file.sizeKb} KB · ${file.version}`}
        </span>
      </span>
    </a>
  );
}

function SavedOrders({ orders }: { orders: Lead[] }) {
  const { locale } = useI18n();
  if (!orders.length) return null;
  const title = withExtraLocales({ ar: "الطلبات المحفوظة", en: "Saved requests", nl: "Opgeslagen aanvragen", de: "Gespeicherte Anfragen", tr: "Kayıtlı talepler", fr: "Demandes enregistrées", es: "Solicitudes guardadas" })[locale];
  const estimateLabel = withExtraLocales({ ar: "التقدير", en: "Estimate", nl: "Schatting", de: "Schätzung", tr: "Tahmin", fr: "Estimation", es: "Estimación" })[locale];
  return <section className="mt-5 rounded-3xl border border-black bg-white p-5 sm:p-6">
    <div className="flex items-center gap-2"><ReceiptText className="size-5 text-neon-blue"/><h2 className="text-lg font-bold text-black">{title}</h2></div>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">{orders.map((order) => <Link key={order.id} href={`/${locale}/portal/orders/${order.id}`} className="block rounded-2xl border border-black/15 bg-base p-5 transition hover:-translate-y-1 hover:border-black"><div className="flex items-center justify-between gap-3"><span className="font-bold text-black">{order.projectType}</span><Badge variant="outline">{order.status}</Badge></div><p className="mt-3 text-sm text-ink-low">{order.services.join(" · ")}</p><div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs"><span className="flex items-center gap-2 text-ink-low"><ReceiptText className="size-4" />{estimateLabel}</span><span className="font-bold text-black">{new Intl.NumberFormat(locale, { style: "currency", currency: order.currency, maximumFractionDigits: 0 }).format(order.budgetEstimate)}</span></div></Link>)}</div>
  </section>;
}

export function ClientDashboard({ viewerName, projects, orders }: ClientDashboardProps) {
  const { t, locale } = useI18n();
  const [index, setIndex] = useState(0);
  const [feedbackState, feedbackAction, feedbackPending] = useActionState(
    postFeedbackAction,
    initialState,
  );
  const [messageState, messageAction, messagePending] = useActionState(
    postMessageAction,
    initialState,
  );

  if (projects.length === 0) {
    return (
      <section className="container-x py-20">
        <div className="mx-auto max-w-4xl">
        <div className="glass-card p-8 text-center">
          {orders.length ? <PackageCheck className="mx-auto size-8 text-neon-cyan" /> : <Hourglass className="mx-auto size-8 text-neon-cyan" />}
          <h1 className="mt-4 text-2xl font-bold text-ink-hi">
            {t.portal.welcome}, {viewerName}
          </h1>
          <p className="mt-3 text-sm text-ink-low" dir="auto">
            {orders.length ? (locale === "ar" ? "طلباتك محفوظة هنا. سنحوّل الطلب إلى مشروع بعد اعتماد النطاق والدفعة الأولى." : localizeForLocale("Your requests are saved here. They become projects after scope and deposit approval.", locale)) : t.auth.noProjects}
          </p>
        </div>
        <SavedOrders orders={orders} />
        </div>
      </section>
    );
  }

  const active = projects[Math.min(index, projects.length - 1)];
  const { project, milestones, files, summary } = active;
  const cancelled = active.cancelled === true;
  const awaitingPayment = !cancelled && active.paymentStatus !== undefined && active.paymentStatus !== "paid";
  const awaitingLabel = awaitingCopy[locale];
  const stageIndex = STAGES.indexOf(project.stage);
  const dateFmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });
  const detailsText = detailCopy[locale];

  return (
    <section className="relative py-12">
      <div className="container-x relative z-content">
        <SavedOrders orders={orders} />

        {projects.length > 1 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {projects.map((p, i) => (
              <Button
                key={p.project.id}
                variant="unstyled"
                size="auto"
                type="button"
                onClick={() => setIndex(i)}
                className={clsx(
                  "rounded-xl border px-4 py-2.5 text-sm font-semibold transition",
                  i === index
                    ? "border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan shadow-glow-cyan"
                    : "border-line-strong bg-white text-ink-low hover:border-neon-blue hover:text-black",
                )}
              >
                {p.project.name}
              </Button>
            ))}
          </div>
        ) : null}

        {/* Progress + estimated remaining time — the two numbers clients ask for. */}
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <div className="glass-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-ink-hi" dir="auto">
                  {project.name}
                </h2>
                {cancelled ? <Badge variant="outline">{t.experience.cancelled}</Badge> : awaitingPayment ? <Badge className="bg-amber-100 text-amber-900">{awaitingLabel}</Badge> : <StatusBadge status={project.stage} label={t.status[project.stage]} />}
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-ink-low" dir="auto">
                {project.summary}
              </p>

              <div className={`mt-6 ${awaitingPayment || cancelled ? "opacity-45" : ""}`}>
                <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                  <span className="text-ink-low">{t.portal.completion}</span>
                  <span className="tabular-nums text-neon-cyan">{summary.percent}%</span>
                </div>
                <ProgressBar value={summary.percent} />
                <p className="mt-2 text-xs text-ink-low">
                  {summary.done}/{summary.total} {t.auth.milestonesDone}
                </p>
              </div>

              <ol className="mt-8 space-y-3">
                {STAGES.map((stage, i) => {
                  const done = i < stageIndex || project.stage === "completed";
                  const current = !cancelled && !awaitingPayment && i === stageIndex && project.stage !== "completed";
                  return (
                    <li key={stage} className="rounded-2xl border border-line-strong p-4">
                      <div className="flex items-center gap-2">
                        {done ? (
                          <CheckCircle2 className="size-5 text-neon-emerald" />
                        ) : current ? (
                          <CircleDot className="size-5 animate-pulse text-neon-cyan" />
                        ) : (
                          <Circle className="size-5 text-ink-mid" />
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
                      <ul className="mt-3 space-y-1 text-sm leading-7 text-ink-low">{(stage === "completed" ? [completedCopy[locale]] : t.deliveryDetails[i] ?? []).map(line => <li key={line}>{line}</li>)}</ul>
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

            <Tabs defaultValue="deliverables" className="contents">
              <div className="glass-card p-2">
                <TabsList>
                  <TabsTrigger value="deliverables">{t.portal.tabs.files}</TabsTrigger>
                  <TabsTrigger value="timeline">{t.portal.tabs.overview}</TabsTrigger>
                  <TabsTrigger value="feedback">{t.portal.tabs.feedback}</TabsTrigger>
                  <TabsTrigger value="messages">{t.portal.tabs.messages}</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="deliverables">
                <div className="glass-card p-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-ink-low">
                    {t.portal.filesTitle}
                  </h3>
                  {files.length === 0 ? (
                    <p className="mt-4 text-sm text-ink-low">—</p>
                  ) : (
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      {files.map((file) => (
                        <MediaCard key={file.id} file={file} />
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="timeline">
                <div className="glass-card p-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-ink-low">
                    {t.portal.milestones}
                  </h3>
                  <ul className="mt-5 space-y-3">
                    {milestones.map((m) => (
                      <li
                        key={m.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line-strong bg-white p-4"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink-hi" dir="auto">
                            {m.title}
                          </p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-low">
                            <CalendarClock className="size-3.5" />
                            {m.dueDate ? dateFmt.format(m.dueDate) : "—"}
                          </p>
                        </div>
                        <StatusBadge status={m.status} label={t.status[m.status]} />
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="feedback">
                <div className="glass-card space-y-5 p-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-ink-low">
                    {t.portal.feedbackTitle}
                  </h3>

                  <ul className="space-y-3">
                    {active.feedback.map((f) => (
                      <li key={f.id} className="rounded-xl border border-line-strong bg-white p-4">
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="outline">{f.category}</Badge>
                          {f.resolved ? (
                            <span className="text-xs font-semibold text-neon-emerald">✓</span>
                          ) : null}
                        </div>
                        <p className="mt-2 text-sm text-ink-mid" dir="auto">
                          {f.body}
                        </p>
                      </li>
                    ))}
                  </ul>

                  {feedbackState.message ? (
                    <Alert
                      role="alert"
                      className={
                        feedbackState.ok
                          ? "border-emerald-500/40 bg-emerald-500/10"
                          : "border-rose-500/40 bg-rose-500/10"
                      }
                    >
                      <AlertDescription>{feedbackState.message}</AlertDescription>
                    </Alert>
                  ) : null}

                  <form action={feedbackAction} className="space-y-3">
                    <input type="hidden" name="projectId" value={project.id} />
                    <input type="hidden" name="category" value="design" />
                    <Textarea
                      name="body"
                      rows={3}
                      required
                      className="field"
                      dir="auto"
                      placeholder={t.portal.feedbackPlaceholder}
                    />
                    <Button type="submit" disabled={feedbackPending} className="gap-2">
                      {feedbackPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Send className="size-4" />
                      )}
                      {t.portal.tabs.feedback}
                    </Button>
                  </form>
                </div>
              </TabsContent>

              <TabsContent value="messages">
                <div className="glass-card space-y-5 p-6">
                  <ul className="space-y-3">
                    {active.messages.map((m) => (
                      <li key={m.id} className="rounded-xl border border-line-strong bg-white p-4">
                        <p className="text-sm text-ink-mid" dir="auto">
                          {m.body}
                        </p>
                        <p className="mt-1.5 text-xs text-ink-low">{dateFmt.format(m.createdAt)}</p>
                      </li>
                    ))}
                  </ul>

                  {messageState.message ? (
                    <Alert
                      role="alert"
                      className={
                        messageState.ok
                          ? "border-emerald-500/40 bg-emerald-500/10"
                          : "border-rose-500/40 bg-rose-500/10"
                      }
                    >
                      <AlertDescription>{messageState.message}</AlertDescription>
                    </Alert>
                  ) : null}

                  <form action={messageAction} className="space-y-3">
                    <input type="hidden" name="projectId" value={project.id} />
                    <Textarea name="body" rows={3} required className="field" dir="auto" />
                    <Button type="submit" disabled={messagePending} className="gap-2">
                      {messagePending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Send className="size-4" />
                      )}
                      {t.portal.tabs.messages}
                    </Button>
                  </form>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <aside className="space-y-4">
            <div className="glass-card p-5">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ink-low">
                <Clock3 className="size-3.5" />
                {t.auth.estimatedTime}
              </p>
              {cancelled || awaitingPayment ? <p className="mt-3 text-sm leading-7 text-ink-low">{cancelled ? t.experience.cancelled : builderCopy.timing[locale]}</p> : <><p className="mt-3 text-4xl font-black tabular-nums text-neon-cyan">
                {summary.remainingHours}
              </p>
              <p className="text-sm text-ink-low">{t.auth.hours}</p>
              {summary.daysLeft !== null ? (
                <p className="mt-4 border-t border-line pt-4 text-sm text-ink-mid">
                  <span className="font-bold tabular-nums text-ink-hi">{summary.daysLeft}</span>{" "}
                  {t.auth.daysLeft}
                </p>
              ) : null}</>}
            </div>

            <div className="glass-card p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-ink-low">{detailsText.details}</p>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3"><dt className="text-ink-low">{detailsText.budget}</dt><dd className="font-bold text-black">{new Intl.NumberFormat(locale, { style: "currency", currency: project.currency, maximumFractionDigits: 0 }).format(project.budget)}</dd></div>
                <div className="flex items-center justify-between gap-3"><dt className="text-ink-low">{detailsText.start}</dt><dd className="font-semibold text-black">{project.startDate ? dateFmt.format(project.startDate) : "—"}</dd></div>
                <div className="flex items-center justify-between gap-3"><dt className="text-ink-low">{detailsText.deadline}</dt><dd className="font-semibold text-black">{project.deadline ? dateFmt.format(project.deadline) : "—"}</dd></div>
              </dl>
            </div>

            <div className="glass-card p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-ink-low">
                {t.portal.nextDelivery}
              </p>
              <p className="mt-2 text-sm font-semibold text-ink-hi" dir="auto">
                {cancelled ? "—" : awaitingPayment ? awaitingLabel : milestones.find((m) => m.status !== "done")?.title ?? "—"}
              </p>
            </div>

            <div className="glass-card p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-ink-low">{t.services.title}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.tech.map((tech) => (
                  <Badge key={tech} variant="outline">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
