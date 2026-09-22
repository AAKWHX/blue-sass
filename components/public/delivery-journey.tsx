"use client";
import { useI18n } from "@/components/providers";
import { Reveal } from "@/components/ui/motion";
function StageArt({ stage,label }: { stage:number; label:string }) {
  return <svg viewBox="0 0 320 180" role="img" aria-label={label} className="w-full motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:-translate-y-1" fill="none">
    <rect x="28" y="20" width="264" height="140" rx="12" fill="#050608" stroke="#AEB6BF"/>
    {stage===0 ? [0,1,2].map(i=><g key={i}><rect x={49+i*77} y="42" width="65" height="18" rx="5" fill="#E8ECF0"/>{Array.from({length:3-i},(_,j)=><rect key={j} x={49+i*77} y={71+j*22} width="65" height="15" rx="4" fill="#232630"/>)}</g>) : stage===1 ? <><rect x="50" y="42" width="105" height="95" rx="7" stroke="#E8ECF0"/><circle cx="103" cy="77" r="20" fill="#AEB6BF"/><path d="M175 50h88m-88 20h60m-60 20h80" stroke="#AEB6BF" strokeWidth="7"/><rect x="175" y="115" width="70" height="20" rx="10" fill="#E8ECF0"/></> : stage===2 ? <path d="m107 59-34 31 34 31m106-62 34 31-34 31m-42-73-22 86" stroke="#E8ECF0" strokeWidth="6" strokeLinecap="round"/> : stage===3 ? [0,1,2].map(i=><g key={i}><path d={`m53 ${54+i*32} 7 7 14-17`} stroke="#6FE39C" strokeWidth="3"/><path d={`M96 ${53+i*32}h145`} stroke="#AEB6BF" strokeWidth="8"/></g>) : <><circle cx="160" cy="90" r="45" stroke="#E8ECF0"/><path d="m137 90 15 15 33-36" stroke="#6FE39C" strokeWidth="5" strokeLinecap="round"/></>}
  </svg>;
}
export function DeliveryJourney() {
  const { t } = useI18n();
  return <section className="section-y border-b border-line"><div className="container-x">
    <Reveal><h2 className="text-3xl font-semibold sm:text-5xl">{t.process.title}</h2><p className="mt-4 max-w-2xl leading-7 text-ink-low">{t.process.subtitle}</p></Reveal>
    <ol className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{t.process.steps.map((step,i)=><Reveal as="li" key={step.title} delay={i*.05} className="group rounded-3xl border border-line bg-surface p-5">
      <span className="inline-flex size-10 items-center justify-center rounded-full border border-white/25 text-sm font-semibold text-white">{String(i+1).padStart(2,'0')}</span><div className="my-5"><StageArt stage={i} label={step.title}/></div><h3 className="text-xl font-semibold">{step.title}</h3><p className="mt-3 text-sm leading-7 text-ink-low">{step.desc}</p>
    </Reveal>)}</ol>
  </div></section>;
}
