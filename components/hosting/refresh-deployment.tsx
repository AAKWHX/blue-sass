"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
export function RefreshDeployment({ id, label }: { id: string; label: string }) { const router=useRouter(); const [busy,setBusy]=useState(false); return <Button variant="outline" disabled={busy} onClick={async()=>{setBusy(true); await fetch(`/api/hosting/sites/${id}/refresh`,{method:"POST"}); setBusy(false); router.refresh();}}><RefreshCw className={`size-4 ${busy?"animate-spin":""}`}/>{label}</Button>; }
