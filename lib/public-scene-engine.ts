import type { gsap as GSAP } from 'gsap';
import type { ScrollTrigger as Trigger } from 'gsap/ScrollTrigger';

type Engine = typeof GSAP;
type Plugin = typeof Trigger;
export const publicMotionPaths = new Set(['','services','about','contact','projects','reviews','pricing','templates','subscriptions','create-project','products','hosting','jobs','marketplace','tools','privacy','terms','listings','quote','audit','discover','compare']);
export const publicMotionPath = (pathname: string) => publicMotionPaths.has(pathname.split('/')[2] || '');
export const headerOffset = () => (document.querySelector('header')?.getBoundingClientRect().height || 80) + 12;

export function footerScene(gsap: Engine) {
  const footer=document.querySelector<HTMLElement>('footer.studio-footer');
  const content=footer?.querySelector<HTMLElement>('.container-x');
  if(footer&&content)gsap.fromTo(content,{y:45,scale:.97},{y:0,scale:1,ease:'none',scrollTrigger:{id:'bs-public-footer',trigger:footer,start:'top bottom',end:'top 45%',scrub:.45}});
}

/** A native-scroll horizontal scene. Focusing an off-screen link seeks its matching position. */
export function horizontalScene(gsap: Engine, ScrollTrigger: Plugin, viewport: HTMLElement, rtl: boolean) {
  const track = viewport.querySelector<HTMLElement>('[data-cinematic-track]');
  if (!track || track.children.length < 2) return () => {};
  viewport.dataset.trackScene = 'true';
  const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
  if (viewport.offsetHeight > innerHeight - headerOffset() - 12) { delete viewport.dataset.trackScene; return () => {}; }
  const tween = gsap.to(track, { x: () => (rtl ? 1 : -1) * distance(), ease: 'none', scrollTrigger: {
    id: 'bs-public-horizontal', trigger: viewport, pin: viewport, start: () => `top top+=${headerOffset()}`,
    end: () => `+=${Math.max(innerHeight, distance())}`, scrub: .45, invalidateOnRefresh: true,
    onRefresh: self => {viewport.dataset.sceneStart=String(self.start);viewport.dataset.sceneEnd=String(self.end);},
    onUpdate: self => { viewport.dataset.sceneProgress = self.progress.toFixed(3); },
  } });
  const focus = (event: FocusEvent) => {
    const card = (event.target as HTMLElement).closest<HTMLElement>('[data-cinematic-track] > *');
    const trigger = tween.scrollTrigger;
    if (!card || !trigger) return;
    const index = [...track.children].indexOf(card);
    const fraction = index / Math.max(1,track.children.length - 1);
    window.scrollTo({ top: trigger.start + fraction * (trigger.end - trigger.start), behavior: 'instant' });
  };
  viewport.addEventListener('focusin', focus);
  ScrollTrigger.refresh();
  return () => { viewport.removeEventListener('focusin', focus); delete viewport.dataset.trackScene; delete viewport.dataset.sceneProgress; };
}

/** Pin the service stage while each real service advances; keep hidden links out of Tab order. */
export function serviceScene(gsap: Engine, root: HTMLElement, rtl: boolean) {
  const stage = root.querySelector<HTMLElement>('[data-service-scenes]');
  if (!stage) return () => {};
  const cards = [...stage.querySelectorAll<HTMLElement>('[data-service-scene]')].sort((a,b) => Number(a.dataset.serviceScene)-Number(b.dataset.serviceScene));
  const buttons = [...stage.querySelectorAll<HTMLButtonElement>('[data-scene-select]')];
  if (cards.length < 2) return () => {};
  const side = rtl ? -1 : 1;
  stage.dataset.stacked = 'true';
  cards.forEach((card,i) => gsap.set(card,{ x: side * Math.min(i,2)*12, y: Math.min(i,2)*12, rotation: side*Math.min(i,2)*3 }));
  const timeline = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
    id: 'bs-home-services', trigger: stage, pin: stage, start: () => `top top+=${headerOffset()}`,
    end: () => `+=${innerHeight * Math.max(2, cards.length * .65)}`, scrub: .4, invalidateOnRefresh: true,
    onRefresh: self => {stage.dataset.sceneStart=String(self.start);stage.dataset.sceneEnd=String(self.end);},
  } });
  for(let i=0;i<cards.length-1;i++) {
    timeline.to(cards[i],{ x:-side*90,y:-120,rotation:-side*10,scale:.88,opacity:0,duration:.65 },i+.35)
      .to(cards[i+1],{x:0,y:0,rotation:0,duration:.65},i+.35);
  }
  // Give the final card a stable reading stop at the end.
  timeline.to({}, {duration:.5},cards.length-1);
  let active = -1;
  const sync = () => {
    const index = Math.min(cards.length-1,Math.floor(timeline.time()));
    if(index===active) return; active=index; stage.dataset.activeService=String(index);
    cards.forEach((card,i)=>{card.inert=i!==index;card.setAttribute('aria-hidden',String(i!==index));});
    buttons.forEach((button,i)=>{if(i===index)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
  };
  timeline.eventCallback('onUpdate',sync); sync();
  const select = (event: Event) => {
    const button=(event.target as HTMLElement).closest<HTMLElement>('[data-scene-select]'); const trigger=timeline.scrollTrigger;
    if(!button||!trigger)return;const time=Number(button.dataset.sceneSelect)+.1;
    window.scrollTo({top:trigger.start+time/timeline.duration()*(trigger.end-trigger.start),behavior:'instant'});
  };
  stage.addEventListener('click',select);
  return ()=>{stage.removeEventListener('click',select);delete stage.dataset.stacked;delete stage.dataset.activeService;cards.forEach(card=>{card.inert=false;card.removeAttribute('aria-hidden');});buttons.forEach(button=>button.removeAttribute('aria-current'));};
}
