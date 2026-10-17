"use client";
import { useState } from "react";
import { qrModes, qrPayload } from "@/lib/tools/qr";
import QRCode from "qrcode";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toolsUi } from "@/lib/i18n/tools-ui";
import { toolFormCopy } from "@/lib/i18n/tool-form-copy";
import type { Locale } from "@/lib/i18n/config";
const modes=qrModes;
export function QrTool({locale}:{locale:Locale}){
 const c=toolsUi(locale);const [mode,setMode]=useState<typeof modes[number]>("URL");const [value,setValue]=useState("");const [password,setPassword]=useState("");const [image,setImage]=useState("");const [svg,setSvg]=useState("");const [busy,setBusy]=useState(false);const [error,setError]=useState(false);
 function download(data:string,name:string){const link=document.createElement("a");link.href=data;link.download=name;link.click();}
 return <form onSubmit={async event=>{event.preventDefault();if(busy)return;setBusy(true);setError(false);try{const text=qrPayload(mode,value,password);const [png,vector]=await Promise.all([QRCode.toDataURL(text,{width:640,margin:3,errorCorrectionLevel:"M"}),QRCode.toString(text,{type:"svg",margin:3,errorCorrectionLevel:"M"})]);setImage(png);setSvg(vector);}catch{setImage("");setError(true);}finally{setBusy(false);}}} className="space-y-6">
 <div className="flex flex-wrap gap-2">{modes.map(item=><Button type="button" key={item} variant={mode===item?"neon":"outline"} aria-pressed={mode===item} onClick={()=>{setMode(item);setImage("");}}>{item in toolFormCopy(locale).qr?toolFormCopy(locale).qr[item as "Text"|"Email"|"Phone"]:item}</Button>)}</div>
 <Label htmlFor="qr-data">{mode==="Wi-Fi"?"SSID":c.data}</Label><Textarea id="qr-data" dir="auto" required maxLength={1500} value={value} onChange={e=>{setValue(e.target.value);setImage("");}} placeholder={mode==="vCard"?"BEGIN:VCARD\nVERSION:3.0\nFN:Name\nEND:VCARD":undefined}/>
 {mode==="Wi-Fi"&&<Input aria-label={toolFormCopy(locale).qr.password} type="password" maxLength={100} value={password} onChange={e=>{setPassword(e.target.value);setImage("");}} autoComplete="off"/>}
 <Button type="submit" variant="neon" disabled={busy||!value.trim()}>{busy?c.processing:c.generate}</Button>{error&&<p role="alert">{c.error}</p>}
 {image&&<div className="grid gap-5 md:grid-cols-2"><div className="rounded-2xl bg-white p-5"><Image unoptimized src={image} alt="QR" width={320} height={320} className="mx-auto h-auto max-w-full"/></div><div className="flex flex-col justify-center gap-3"><Button type="button" variant="outline" onClick={()=>download(image,"blue-sass-qr.png")}>{c.download} PNG</Button><Button type="button" variant="outline" onClick={()=>{const url=URL.createObjectURL(new Blob([svg],{type:"image/svg+xml"}));download(url,"blue-sass-qr.svg");setTimeout(()=>URL.revokeObjectURL(url),1000);}}>{c.download} SVG</Button></div></div>}
 </form>;
}
