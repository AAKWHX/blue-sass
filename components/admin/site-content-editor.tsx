"use client";
import {useActionState,useState} from "react";
import {saveSiteMetrics} from "@/app/actions/site-content";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {useI18n} from "@/components/providers";
import {toolsUi} from "@/lib/i18n/tools-ui";
export function SiteContentEditor({initial}:{initial:{label:string;value:number;suffix:string}[]}){const {locale,t}=useI18n();const c=toolsUi(locale);const [rows,setRows]=useState(initial);const [state,action,pending]=useActionState(saveSiteMetrics,{ok:false});const [submitted,setSubmitted]=useState(false);
 return <form action={action} onSubmit={()=>setSubmitted(true)} className="space-y-5"><Input type="hidden" name="metrics" value={JSON.stringify(rows)}/>{rows.map((row,index)=><div key={index} className="grid gap-4 rounded-2xl border border-white/15 p-5 sm:grid-cols-[2fr_1fr_1fr_auto]">{[{key:"label",label:t.admin.cms.label},{key:"value",label:t.admin.cms.value},{key:"suffix",label:t.admin.cms.suffix}].map(field=><div key={field.key}><Label htmlFor={`metric-${index}-${field.key}`}>{field.label}</Label><Input id={`metric-${index}-${field.key}`} type={field.key==="value"?"number":"text"} min={0} max={1e9} maxLength={field.key==="label"?100:12} required={field.key==="label"} value={row[field.key as keyof typeof row]} onChange={event=>{setSubmitted(false);setRows(rows.map((item,i)=>i===index?{...item,[field.key]:field.key==="value"?Number(event.target.value):event.target.value}:item));}}/></div>)}<Button type="button" variant="outline" disabled={pending} onClick={()=>setRows(rows.filter((_,i)=>i!==index))}>×</Button></div>)}<div className="grid gap-3 sm:grid-cols-2"><Button type="button" variant="outline" disabled={pending||rows.length>=12} onClick={()=>{setSubmitted(false);setRows([...rows,{label:"",value:0,suffix:""}]);}}>{t.admin.cms.addStat}</Button><Button type="submit" variant="neon" disabled={pending}>{pending?c.processing:t.experience.save}</Button></div>{submitted&&!pending&&<p role={state.ok?"status":"alert"}>{state.ok?t.experience.saved:c.error}</p>}</form>;
}
