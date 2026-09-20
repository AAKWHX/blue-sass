"use client";

/**
 * Sales inbox: every quote request submitted from the public estimator.
 *
 * Rendered above the ERP console on /admin. Status changes are posted through
 * a server action, so the role check happens on the server.
 */
import { Inbox, Mail, Phone } from "lucide-react";
import { updateLeadStatusAction } from "@/app/actions/leads";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Lead, LeadStatus } from "@/lib/db/schema";

const NEXT_STATUS: Record<LeadStatus, LeadStatus> = {
  new: "contacted",
  contacted: "qualified",
  qualified: "won",
  won: "won",
  lost: "lost",
};

const STATUS_TONE: Record<LeadStatus, string> = {
  new: "border-cyan-500/40 bg-cyan-500/10 text-neon-cyan",
  contacted: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  qualified: "border-violet-500/40 bg-violet-500/10 text-violet-300",
  won: "border-emerald-500/40 bg-emerald-500/10 text-neon-emerald",
  lost: "border-rose-500/40 bg-rose-500/10 text-rose-300",
};

export function LeadsPanel({ leads, locale }: { leads: Lead[]; locale: string }) {
  const money = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
  const dateFmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" });

  return (
    <div className="container-x pt-10">
      <div className="glass-card p-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-ink-low">
            <Inbox className="size-4 text-neon-cyan" />
            Quote requests
          </h2>
          <Badge variant="outline">{leads.length}</Badge>
        </header>

        {leads.length === 0 ? (
          <p className="mt-6 text-sm text-ink-low">
            No quote requests yet. Submissions from the public estimator land here.
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Estimate</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <span className="block font-semibold text-ink-hi" dir="auto">
                        {lead.name}
                      </span>
                      {lead.company ? (
                        <span className="block text-xs text-ink-low" dir="auto">
                          {lead.company}
                        </span>
                      ) : null}
                      <span className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink-low">
                        <a
                          href={`mailto:${lead.email}`}
                          className="flex items-center gap-1 hover:text-neon-cyan"
                          dir="ltr"
                        >
                          <Mail className="size-3" />
                          {lead.email}
                        </a>
                        {lead.phone ? (
                          <span className="flex items-center gap-1" dir="ltr">
                            <Phone className="size-3" />
                            {lead.phone}
                          </span>
                        ) : null}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="block text-sm font-medium text-ink-mid">
                        {lead.projectType}
                      </span>
                      <span className="mt-1 flex flex-wrap gap-1">
                        {lead.services.slice(0, 4).map((service) => (
                          <Badge key={service} variant="outline" className="text-[10px]">
                            {service}
                          </Badge>
                        ))}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="block font-bold tabular-nums text-ink-hi">
                        {money.format(lead.budgetEstimate)}
                      </span>
                      <span className="block text-xs text-ink-low">
                        ~{lead.timelineWeeks} weeks · {dateFmt.format(lead.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={STATUS_TONE[lead.status]}>
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {lead.status === "won" || lead.status === "lost" ? null : (
                        <form action={updateLeadStatusAction} className="flex gap-1.5">
                          <input type="hidden" name="id" value={lead.id} />
                          <input type="hidden" name="status" value={NEXT_STATUS[lead.status]} />
                          <Button type="submit" variant="ghostNeon" className="!px-3 !py-1.5 !text-xs">
                            → {NEXT_STATUS[lead.status]}
                          </Button>
                        </form>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
