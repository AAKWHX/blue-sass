export function ServiceArt({ kind, label }: { kind: string; label: string }) {
  const mobile = kind === "android" || kind === "ios";
  return <svg role="img" aria-label={label} viewBox="0 0 480 300" className="h-auto w-full motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.03]" fill="none">
    <rect width="480" height="300" rx="24" fill="#101216"/><circle cx="390" cy="45" r="125" stroke="#232630"/><circle cx="90" cy="275" r="125" stroke="#232630"/>
    {mobile ? <g transform={kind==='ios'?'translate(32 0)':undefined}>
      <rect x="138" y="24" width="150" height="252" rx="28" fill="#050608" stroke="#AEB6BF" strokeWidth="2"/>
      <rect x="184" y="35" width="58" height="8" rx="4" fill="#AEB6BF"/><circle cx="213" cy="100" r="28" fill="#E8ECF0"/>
      {[0,1,2].map(i=><rect key={i} x="156" y={151+i*27} width={i===1?76:112} height="12" rx="6" fill="#AEB6BF" opacity={1-i*.22}/>)}
      <rect x="156" y="239" width="112" height="15" rx="7" fill="#E8ECF0"/><path d="m320 124 14 14 28-31" stroke="#E8ECF0" strokeWidth="6"/>
    </g> : kind==='ai' ? <>
      {[80,240,400].map((x,i)=><g key={x}><path d={`M${x} 150H240`} stroke="#AEB6BF" strokeWidth="2"/><rect x={x-35} y={i===1?100:115} width="70" height={i===1?100:70} rx="20" fill="#050608" stroke="#E8ECF0"/><circle cx={x} cy="150" r={i===1?20:10} stroke="#E8ECF0" strokeWidth="3"/></g>)}
      <path d="M240 100V55m0 145v45" stroke="#AEB6BF" strokeDasharray="5 6"/>
    </> : kind==='design' ? <>
      <rect x="90" y="45" width="230" height="205" rx="12" fill="#050608" stroke="#AEB6BF"/><path d="M120 195 175 85l55 110m-91-32h72" stroke="#E8ECF0" strokeWidth="8"/>
      {[0,1,2].map(i=><rect key={i} x={270+i*30} y={100+i*30} width="60" height="60" rx="15" fill={['#E8ECF0','#AEB6BF','#232630'][i]} stroke="#E8ECF0"/>)}
    </> : <>
      <rect x="48" y="42" width="384" height="216" rx="14" fill="#050608" stroke="#AEB6BF"/><path d="M48 72h384" stroke="#232630"/>
      {[65,79,93].map(x=><circle key={x} cx={x} cy="57" r="3" fill="#AEB6BF"/>)}
      {kind==='store' ? [0,1,2].map(i=><g key={i}><rect x={74+i*113} y="94" width="101" height="115" rx="10" fill="#232630"/><path d={`M${104+i*113} 139v-10a20 20 0 0 1 40 0v10`} stroke="#E8ECF0"/><rect x={96+i*113} y="139" width="55" height="43" rx="5" stroke="#E8ECF0"/><path d={`M${85+i*113} 229h60`} stroke="#AEB6BF" strokeWidth="5"/></g>) : kind==='windows'||kind==='erp' ? <>
        <rect x="60" y="84" width="65" height="159" rx="6" fill="#232630"/>{[0,1,2,3].map(i=><rect key={i} x={150+i*63} y={193-i*25} width="37" height={40+i*25} rx="5" fill={i===3?'#E8ECF0':'#AEB6BF'}/>)}<path d="M150 101h96" stroke="#E8ECF0" strokeWidth="8"/>
      </> : <><rect x="280" y="96" width="122" height="134" rx="16" fill="#232630"/><circle cx="341" cy="148" r="32" stroke="#E8ECF0" strokeWidth="2"/><path d="M78 113h152m-152 24h120m-120 30h140" stroke="#AEB6BF" strokeWidth="9"/><rect x="78" y="195" width="85" height="24" rx="12" fill="#E8ECF0"/></>}
    </>}
  </svg>;
}
