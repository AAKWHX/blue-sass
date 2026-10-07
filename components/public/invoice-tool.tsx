"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { businessUi } from "@/lib/i18n/business-ui";
import { toolsUi } from "@/lib/i18n/tools-ui";
import type { Locale } from "@/lib/i18n/config";
import { invoiceTotals } from "@/lib/tools/invoice";
export function InvoiceTool({locale}:{locale:Locale}){
 const c=businessUi(locale);const t=toolsUi(locale);const [items,setItems]=useState([{name:"",quantity:1,price:0}]);const [vat,setVat]=useState(21);const [discount,setDiscount]=useState(0);const [busy,setBusy]=useState(false);const [error,setError]=useState(false);
 const totals=invoiceTotals({company:"",customer:"",number:"",due:"",notes:"",items,vat,discount});const money=(v:number)=>new Intl.NumberFormat(locale,{style:"currency",currency:"EUR"}).format(v/100);
 return <form className="space-y-6" onSubmit={async event=>{event.preventDefault();if(busy)return;const data=new FormData(event.currentTarget);setBusy(true);setError(false);try{const response=await fetch("/api/tools/invoice",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({locale,company:data.get("company"),customer:data.get("customer"),number:data.get("number"),due:data.get("due"),notes:data.get("notes"),vat,discount,items})});if(!response.ok)throw Error();const url=URL.createObjectURL(await response.blob());const link=document.createElement("a");link.href=url;link.download="blue-sass-invoice.pdf";link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch{setError(true);}finally{setBusy(false);}}}>
 <div className="grid gap-4 sm:grid-cols-2">{[{name:"company",label:c.company},{name:"customer",label:c.customer},{name:"number",label:c.invoiceNumber},{name:"due",label:c.due,type:"date"}].map(field=><div key={field.name}><Label htmlFor={`invoice-${field.name}`}>{field.label}</Label><Input id={`invoice-${field.name}`} name={field.name} type={field.type??"text"} required maxLength={160} className="mt-2"/></div>)}</div>
 <div className="space-y-4">{items.map((item,index)=><div key={index} className="grid gap-3 rounded-xl border border-white/15 p-4 sm:grid-cols-[2fr_1fr_1fr_auto]">{[{key:"name",label:c.item},{key:"quantity",label:c.quantity},{key:"price",label:t.price}].map(field=><div key={field.key}><Label htmlFor={`${field.key}-${index}`}>{field.label}</Label><Input id={`${field.key}-${index}`} type={field.key==="name"?"text":"number"} step="0.01" min={field.key==="quantity"?0.01:0} max={field.key==="quantity"?10000:100000} required value={item[field.key as keyof typeof item]} onChange={e=>setItems(items.map((row,i)=>i===index?{...row,[field.key]:field.key==="name"?e.target.value:Number(e.target.value)}:row))}/></div>)}<Button type="button" variant="outline" aria-label={`${c.item} ${index+1}`} disabled={items.length===1} onClick={()=>setItems(items.filter((_,i)=>i!==index))}>×</Button></div>)}</div>
 <Button type="button" variant="outline" disabled={items.length>=20} onClick={()=>setItems([...items,{name:"",quantity:1,price:0}])}>{c.addItem}</Button>
 <div className="grid gap-4 sm:grid-cols-2">{[{label:c.vat,value:vat,set:setVat},{label:c.discount,value:discount,set:setDiscount}].map((field,i)=><div key={field.label}><Label htmlFor={`invoice-rate-${i}`}>{field.label}</Label><Input id={`invoice-rate-${i}`} type="number" min={0} max={100} step="0.01" value={field.value} onChange={e=>field.set(Number(e.target.value))}/></div>)}</div>
 <Label htmlFor="invoice-notes">{c.notes}</Label><Input id="invoice-notes" name="notes" maxLength={1500}/><p className="text-2xl font-semibold">{c.total}: {money(totals.total)}</p>
 <Button type="submit" variant="neon" disabled={busy}>{busy?t.processing:`${t.download} PDF`}</Button>{error&&<p role="alert">{t.error}</p>}
 </form>;
}
