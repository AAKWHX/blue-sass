"use client";
import {useCallback,useEffect,useRef} from 'react';
export function useSculptureAudio(){
 const audio=useRef<{context:AudioContext;voices:{oscillator:OscillatorNode;frequency:number}[];gain:GainNode;panner:StereoPannerNode;filter:BiquadFilterNode}|null>(null);
 const stop=useCallback(()=>{const a=audio.current;if(!a)return;const now=a.context.currentTime;a.gain.gain.cancelAndHoldAtTime(now);a.gain.gain.setTargetAtTime(0,now,.09);},[]);
 const start=()=>{try{if(!audio.current){
  const context=new AudioContext(),gain=context.createGain(),panner=context.createStereoPanner(),filter=context.createBiquadFilter();gain.gain.value=0;filter.type='lowpass';filter.frequency.value=2100;filter.Q.value=.4;
  const voices=[146.832,220,293.665,369.994,587.33].map((frequency,i)=>{const oscillator=context.createOscillator(),level=context.createGain();oscillator.type='sine';oscillator.frequency.value=frequency;oscillator.detune.value=i%2?2:-2;level.gain.value=[.5,.23,.14,.09,.04][i];oscillator.connect(level);level.connect(filter);oscillator.start();return{oscillator,frequency};});
  filter.connect(gain);gain.connect(panner);panner.connect(context.destination);audio.current={context,voices,gain,panner,filter};
 }const a=audio.current,now=a.context.currentTime;void a.context.resume().catch(()=>{});a.gain.gain.cancelAndHoldAtTime(now);a.gain.gain.setTargetAtTime(.018,now,.18);a.gain.gain.linearRampToValueAtTime(.038,now+3);}catch{stop();}};
 const shatter=useCallback(()=>{const a=audio.current;if(!a)return;stop();try{const n=a.context,buffer=n.createBuffer(1,Math.ceil(n.sampleRate*.36),n.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.exp(-i/(n.sampleRate*.055));const source=n.createBufferSource(),filter=n.createBiquadFilter(),gain=n.createGain();source.buffer=buffer;filter.type='highpass';filter.frequency.value=2600;gain.gain.value=.025;source.connect(filter);filter.connect(gain);gain.connect(n.destination);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};source.start();}catch{/* Sound is optional; navigation remains available. */}},[stop]);
 const move=(speed:number,direction=0)=>{const a=audio.current;if(!a)return;const now=a.context.currentTime,intensity=Math.min(speed,60)/60;a.filter.frequency.setTargetAtTime(1400+intensity*1800,now,.16);a.panner.pan.setTargetAtTime(Math.max(-.6,Math.min(.6,direction/35)),now,.18);a.voices.forEach((voice,i)=>voice.oscillator.frequency.setTargetAtTime(voice.frequency*(1+intensity*.012*(i%2?1:-1)),now,.14));};
 useEffect(()=>{const silence=()=>stop();addEventListener('blur',silence);document.addEventListener('visibilitychange',silence);return()=>{removeEventListener('blur',silence);document.removeEventListener('visibilitychange',silence);const a=audio.current;a?.voices.forEach(voice=>voice.oscillator.stop());void a?.context.close().catch(()=>{});audio.current=null;};},[stop]);
 return{start,move,stop,shatter};
}
