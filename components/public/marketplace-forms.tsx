"use client";
import {useActionState,useState} from "react";
import {createListingAction,offerAction} from "@/app/actions/marketplace";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from "@/components/ui/select";
import {businessUi} from "@/lib/i18n/business-ui";
import {toolsUi} from "@/lib/i18n/tools-ui";
import {jobTiers,listingCategories,type ListingKind,type JobTier} from "@/lib/marketplace";
import type {Locale} from "@/lib/i18n/config";
export function ListingForm({locale,kind,isOwner}:{locale:Locale;kind:ListingKind;isOwner:boolean}){
 const c=businessUi(locale);const t=toolsUi(locale);const [state,action,pending]=useActionState(createListingAction,{ok:false,message:""});const [tier,setTier]=useState<JobTier>("basic");const [category,setCategory]=useState<string>(kind==="product"?"Templates":"Developer");
 return <form action={action} className="space-y-5"><Input type="hidden" name="locale" value={locale}/><Input type="hidden" name="kind" value={kind}/><Input type="hidden" name="tier" value={tier}/><Input type="hidden" name="category" value={category}/>
 <fieldset disabled={pending} className="space-y-5"><div><Label htmlFor="listing-title">{t.title}</Label><Input id="listing-title" name="title" minLength={5} maxLength={160} required className="mt-2"/></div>
 <div><Label htmlFor="listing-description">{t.details}</Label><Textarea id="listing-description" name="description" minLength={30} maxLength={6000} required className="mt-2 min-h-44"/></div>
 <Label>{c.category}</Label><Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{listingCategories.filter((_,index)=>kind==="product"?index>=5:index<5).map(value=><SelectItem value={value} key={value}>{value}</SelectItem>)}</SelectContent></Select>
 <div className="grid gap-4 sm:grid-cols-2"><div><Label htmlFor="listing-company">{c.company}</Label><Input id="listing-company" name="company" maxLength={160}/></div><div><Label htmlFor="listing-location">{t.details}</Label><Input id="listing-location" name="location" maxLength={120}/></div></div>
 {kind==="job"?<><Input type="hidden" name="price" value={jobTiers[tier].price}/><p className="text-sm">{c.duration}</p><div className="grid gap-3 sm:grid-cols-2">{Object.entries(jobTiers).map(([id,plan])=><Button type="button" key={id} variant={tier===id?"neon":"outline"} aria-pressed={tier===id} onClick={()=>setTier(id as JobTier)}>{plan.label} · €{plan.price}</Button>)}</div><p className="text-sm leading-7 text-white/70">{c.publicationNote}</p></>:<div><Label htmlFor="listing-price">{kind==="project"?c.budget:t.price} EUR</Label><Input id="listing-price" type="number" name="price" min={0} max={100000} step={1} defaultValue={0} required/></div>}
 {kind==="product"&&<><Label htmlFor="listing-file">{c.fileHelp}</Label><Input type="file" id="listing-file" name="file" accept=".zip,.pdf,.txt,.json"/>{isOwner&&<Label htmlFor="platform-product" className="flex items-center gap-3"><Checkbox id="platform-product" name="platformProduct"/>Blue Sass · {c.buy}</Label>}<p className="text-sm leading-7 text-white/70">{c.sellerNote}</p></>}
 <Button type="submit" variant="neon" disabled={pending}>{pending?t.processing:t.submit}</Button></fieldset>{state.message&&<p role={state.ok?"status":"alert"}>{state.message}</p>}
 </form>;
}
export function OfferForm({locale,listingId,job}:{locale:Locale;listingId:string;job:boolean}){const c=businessUi(locale);const t=toolsUi(locale);const [state,action,pending]=useActionState(offerAction,{ok:false,message:""});return <form action={action} className="mt-7 space-y-4"><Input type="hidden" name="locale" value={locale}/><Input type="hidden" name="listingId" value={listingId}/><Label htmlFor="offer-message">{t.details}</Label><Textarea id="offer-message" name="message" minLength={20} maxLength={3000} required disabled={pending}/>{job?<Input type="hidden" name="amount" value={0}/>:<><Label htmlFor="offer-amount">{c.offerAmount} EUR</Label><Input id="offer-amount" type="number" name="amount" min={0} max={100000} step={1} defaultValue={0} required disabled={pending}/></>}<Button type="submit" variant="neon" disabled={pending||state.ok}>{pending?t.processing:c.offer}</Button>{state.message&&<p role={state.ok?"status":"alert"}>{state.message}</p>}</form>;}
