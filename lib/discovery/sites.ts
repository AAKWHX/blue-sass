import {text,type DiscoverySite} from './types';
import {costSites} from './costs';
export const discoveryCategories=[
 {id:'unusual',title:text('أغرب تجارب الويب','Unusual web experiences','Ongewone webervaringen')},
 {id:'cost',title:text('أغلى المواقع: تكلفة البناء','Expensive web projects','Kostbare webprojecten')},
 {id:'design',title:text('أجمل تصاميم المواقع','Exceptional website design','Bijzonder webdesign')},
 {id:'mystery',title:text('مواقع الغموض والاستكشاف','Mystery & exploration','Mysterie & ontdekking')},
 {id:'play',title:text('مواقع للمتعة واللعب','Playful websites','Spelen op het web')},
 {id:'useful',title:text('المواقع الأكثر طلبًا للمهام اليومية','Everyday essentials','Handige dagelijkse tools')},
 {id:'learn',title:text('تعلّم وطور مهاراتك','Learn & build skills','Leren & vaardigheden')},
 {id:'create',title:text('مختبرات الفن والإبداع','Creative playgrounds','Creatieve werkplaatsen')},
 {id:'world',title:text('العالم والفضاء من المتصفح','World & space explorers','Wereld & ruimte')},
 {id:'calm',title:text('استراحة رقمية هادئة','A quieter internet','Een rustiger internet')},
];
const rows=`
#unusual
The Useless Web|https://theuselessweb.com/|بوابة لتجارب ويب غير مألوفة|A doorway to unexpected web experiments|Een deur naar vreemde webexperimenten
Pointer Pointer|https://pointerpointer.com/|صور تشير إلى موضع المؤشر|Photographs that point at your cursor|Foto’s die naar je cursor wijzen
Cat Bounce|https://cat-bounce.com/|قطط تقفز في تجربة تفاعلية|A playful bouncing cat experiment|Een speels experiment met stuiterende katten
Koalas to the Max|https://www.koalastothemax.com/|دوائر تنقسم لتكشف صورة|Split circles to uncover an image|Verdeel cirkels en ontdek een afbeelding
Zoomquilt|https://zoomquilt.org/|رحلة فنية تتعمق بلا نهاية|An endlessly zooming illustrated journey|Een eindeloos inzoomende kunstreis
Window Swap|https://www.window-swap.com/|إطلالات مصورة من نوافذ العالم|Window views from around the world|Uitzichten door ramen over de wereld
Neal.fun|https://neal.fun/|تجارب صغيرة تشرح أفكارًا كبيرة|Small interactive experiments with big ideas|Kleine interactieve experimenten met grote ideeën
Is It Christmas?|https://isitchristmas.com/|فكرة بسيطة تتحول إلى موقع|One very simple question as a website|Eén simpele vraag als website
The Long Doge Challenge|https://longdogechallenge.com/|تحدي تمرير مرح بطابع الكوميكس|A playful comic-inspired scrolling challenge|Een speelse scrolluitdaging
Paper Toilet|https://papertoilet.com/|تفاعل مرح حول لفافة ورق|A playful interaction with a paper roll|Een speelse interactie met een papierrol
Find the Invisible Cow|https://findtheinvisiblecow.com/|لعبة بحث تعتمد على الصوت|An audio-led hidden-object game|Een zoekspel met geluid
Patatap|https://patatap.com/|لوحة مفاتيح تتحول إلى صوت وشكل|A keyboard becomes sound and animation|Een toetsenbord vol geluid en beweging
WeaveSilk|https://weavesilk.com/|رسم ضوئي متناظر بالمؤشر|Draw symmetrical flowing light patterns|Teken symmetrische lichtpatronen
Checkbox Race|https://checkboxrace.com/|سباق مصغّر لعلامات الاختيار|A tiny race made of checkboxes|Een kleine race met selectievakjes
One Million Checkboxes|https://onemillioncheckboxes.com/|تجربة جماعية حول مربعات الاختيار|A collective checkbox experiment|Een gezamenlijk selectievakjesexperiment
#design
Resn|https://www.resn.co.nz/|استوديو لتجارب رقمية تفاعلية|A studio for interactive digital experiences|Een studio voor interactieve digitale ervaringen
Format 3|https://format-3.co/|هوية وتقديم رقمي بتكوين واسع|Brand and digital presentation with spatial composition|Merkpresentatie met ruimtelijke compositie
Locomotive|https://locomotive.ca/|تصميم مواقع وحركة وتجارب علامات|Web design, motion and brand experiences|Webdesign, beweging en merkervaringen
Basement Studio|https://basement.studio/|تجارب ويب تجمع التصميم والتطوير|Web experiences combining design and engineering|Webervaringen met ontwerp en techniek
Active Theory|https://activetheory.net/|تجارب رقمية غامرة للعلامات|Immersive digital experiences for brands|Meeslepende digitale merkervaringen
Bruno Simon|https://bruno-simon.com/|معرض أعمال قابل للاستكشاف التفاعلي|An interactively explorable portfolio|Een interactief te ontdekken portfolio
Lusion|https://lusion.co/|استوديو للتصميم والتجارب المرئية|A studio for design and visual experiences|Een studio voor ontwerp en visuele ervaringen
makemepulse|https://www.makemepulse.com/|تجارب تفاعلية تجمع التقنية والإبداع|Interactive experiences joining technology and creativity|Interactieve ervaringen met techniek en creativiteit
Hello Monday|https://www.hellomonday.com/|مواقع وهوية وتجارب رقمية|Websites, identity and digital experiences|Websites, identiteit en digitale ervaringen
Dogstudio|https://dogstudio.co/|تصميم رقمي وتجارب تفاعلية|Digital design and interactive experiences|Digitaal ontwerp en interactieve ervaringen
Immersive Garden|https://immersive-g.com/|عوالم رقمية بتقديم سينمائي|Digital worlds with cinematic presentation|Digitale werelden met filmische presentatie
Unseen Studio|https://unseen.co/|تجارب إبداعية عبر التصميم والتقنية|Creative experiences through design and technology|Creatieve ervaringen met ontwerp en techniek
14islands|https://14islands.com/|تصميم وتطوير لتجارب رقمية|Design and engineering for digital experiences|Ontwerp en techniek voor digitale ervaringen
FIELD|https://www.field.io/|فن وتصميم وأنظمة مرئية|Art, design and visual systems|Kunst, ontwerp en visuele systemen
Obys|https://obys.agency/|وكالة تصميم بهوية بصرية بارزة|A design agency with expressive visual identity|Een ontwerpbureau met uitgesproken visuele identiteit
#mystery
Notpron|https://notpron.com/|سلسلة ألغاز تعتمد على الملاحظة|A sequence of observation-driven riddles|Een reeks raadsels voor scherpe waarnemers
AE27FF|https://ae27ff.com/|أحجية ويب تنتقل بين مستويات|A web riddle across multiple levels|Een webraadsel met meerdere niveaus
Atlas Obscura|https://www.atlasobscura.com/|قصص وأماكن غير مألوفة من العالم|Unusual places and stories from around the world|Ongewone plekken en verhalen uit de wereld
Library of Babel|https://libraryofbabel.info/|مكتبة حسابية لنصوص محتملة|A computational library of possible texts|Een berekende bibliotheek van mogelijke teksten
Babel Image Archives|https://babelia.libraryofbabel.info/|استكشاف حسابي للصور الممكنة|A computational exploration of possible images|Een berekende verkenning van mogelijke beelden
A Dark Room|https://adarkroom.doublespeakgames.com/|حكاية تفاعلية تبدأ بزر بسيط|An interactive story starting with one action|Een interactief verhaal met een eenvoudig begin
Candy Box 2|https://candybox2.github.io/|مغامرة نصية تتكشف تدريجيًا|A text adventure that gradually unfolds|Een tekstavontuur dat langzaam ontvouwt
Nested|https://orteil.dashnet.org/nested|عوالم نصية داخل عوالم أخرى|Text worlds nested inside other worlds|Tekstwerelden binnen andere werelden
Radio Garden|https://radio.garden/|اكتشاف محطات راديو عبر الكرة الأرضية|Discover radio stations across a globe|Ontdek radiozenders op een wereldbol
Radiooooo|https://radiooooo.com/|استكشاف الموسيقى حسب المكان والزمن|Explore music by place and decade|Ontdek muziek per plaats en decennium
MapCrunch|https://www.mapcrunch.com/|الانتقال إلى مشاهد شوارع عشوائية|Travel to random street-level views|Reis naar willekeurige straatbeelden
Every Noise at Once|https://everynoise.com/|خريطة استكشافية لأنماط الموسيقى|An exploratory map of music genres|Een verkennende kaart van muziekgenres
Interactive Fiction Database|https://ifdb.org/|دليل للقصص والألعاب النصية|A directory of interactive fiction|Een gids voor interactieve verhalen
The Interactive Fiction Archive|https://www.ifarchive.org/|أرشيف تاريخي للأعمال التفاعلية النصية|An archive of text-based interactive works|Een archief van interactieve tekstwerken
Wayback Machine|https://web.archive.org/|استكشف نسخًا تاريخية من صفحات الإنترنت|Explore historical snapshots of web pages|Verken historische versies van webpagina’s
#play
Nicky Case|https://ncase.me/|ألعاب تشرح الأنظمة والسلوك|Games that explain systems and behaviour|Spellen die systemen en gedrag uitleggen
Quick Draw|https://quickdraw.withgoogle.com/|لعبة تخمين الرسومات مع التعلم الآلي|A drawing guessing game using machine learning|Een tekenspel met machinaal leren
Chrome Music Lab|https://musiclab.chromeexperiments.com/|تجارب موسيقية قابلة للتفاعل|Interactive musical experiments|Interactieve muzikale experimenten
GeoGuessr|https://www.geoguessr.com/|تخمين المواقع من مشاهد الشوارع|Guess locations from street imagery|Raad locaties met straatbeelden
Wordle|https://www.nytimes.com/games/wordle/index.html|أحجية كلمات يومية|A daily word puzzle|Een dagelijkse woordpuzzel
Lichess|https://lichess.org/|شطرنج وألغاز وتعلّم|Chess, puzzles and learning|Schaken, puzzels en leren
Chess.com|https://www.chess.com/|شطرنج عبر المتصفح ومحتوى تعليمي|Browser chess and learning resources|Schaken in de browser en lesmateriaal
Agar.io|https://agar.io/|لعبة خلايا جماعية عبر المتصفح|A multiplayer browser game of growing cells|Een browserspel met groeiende cellen
Slither.io|https://slither.io/|لعبة حركة جماعية داخل المتصفح|A multiplayer movement game in the browser|Een bewegingsspel voor meerdere spelers
2048|https://play2048.co/|أحجية دمج الأرقام|A number-merging puzzle|Een puzzel met samenvoegende getallen
Little Alchemy 2|https://littlealchemy2.com/|مزج عناصر لاكتشاف تركيبات جديدة|Combine elements to discover new creations|Combineer elementen tot nieuwe creaties
Skribbl|https://skribbl.io/|رسم وتخمين جماعي|A multiplayer drawing and guessing game|Samen tekenen en raden
Drawasaurus|https://www.drawasaurus.org/|غرف للرسم والتخمين|Rooms for drawing and guessing|Kamers om te tekenen en te raden
City Guesser|https://virtualvacation.us/guess|تخمين المدن من مقاطع مصورة|Guess cities from filmed journeys|Raad steden uit gefilmde reizen
Slow Roads|https://slowroads.io/|قيادة استكشافية داخل المتصفح|An exploratory browser driving experience|Een verkennende rijervaring in de browser
#useful
Canva|https://www.canva.com/|تصميم محتوى وعروض مرئية|Design visual content and presentations|Ontwerp visuele inhoud en presentaties
Figma|https://www.figma.com/|تصميم واجهات ونماذج تفاعلية|Design interfaces and interactive prototypes|Ontwerp interfaces en interactieve prototypes
Notion|https://www.notion.com/|تنظيم المستندات والمشاريع|Organise documents and projects|Organiseer documenten en projecten
GitHub|https://github.com/|استضافة الشيفرة والتعاون البرمجي|Host code and collaborate on software|Beheer code en werk samen aan software
Vercel|https://vercel.com/|نشر واجهات وتطبيقات ويب|Deploy web frontends and applications|Publiceer webinterfaces en applicaties
Render|https://render.com/|تشغيل تطبيقات وخدمات وقواعد بيانات|Run applications, services and databases|Draai applicaties, diensten en databases
Supabase|https://supabase.com/|منصة Postgres ومصادقة وتخزين|A Postgres platform with auth and storage|Een Postgres-platform met authenticatie en opslag
Cloudflare|https://www.cloudflare.com/|شبكة وخدمات لتطبيقات الويب|Network and services for web applications|Netwerk en diensten voor webapplicaties
Netlify|https://www.netlify.com/|بناء ونشر مواقع وتطبيقات|Build and deploy sites and applications|Bouw en publiceer sites en applicaties
Claude|https://claude.com/|مساعد للكتابة والتحليل والبرمجة|An assistant for writing, analysis and coding|Een assistent voor schrijven, analyse en code
Codex|https://learn.chatgpt.com/docs/codex/cli|وكيل للعمل على مشاريع البرمجة|An agent for working on software projects|Een agent voor softwareprojecten
Excalidraw|https://excalidraw.com/|لوحة رسم لتوضيح الأفكار|A sketching canvas for explaining ideas|Een tekencanvas om ideeën uit te leggen
Photopea|https://www.photopea.com/|محرر صور داخل المتصفح|An image editor in the browser|Een beeldbewerker in de browser
Squoosh|https://squoosh.app/|ضغط الصور ومعاينة الجودة|Compress images and compare quality|Comprimeer beelden en vergelijk kwaliteit
iLovePDF|https://www.ilovepdf.com/|أدوات للتعامل مع ملفات PDF|Tools for working with PDF documents|Gereedschappen voor PDF-documenten
#learn
MDN Web Docs|https://developer.mozilla.org/|مرجع لتقنيات وتطوير الويب|Reference material for web technologies|Naslagwerk voor webtechnologie
freeCodeCamp|https://www.freecodecamp.org/|تعلّم البرمجة عبر مسارات عملية|Learn programming through practical curricula|Leer programmeren met praktische leerroutes
The Odin Project|https://www.theodinproject.com/|مسار متكامل لتطوير الويب|A complete curriculum for web development|Een volledig leerpad voor webontwikkeling
CS50|https://cs50.harvard.edu/|مقررات في علوم الحاسوب والبرمجة|Courses in computer science and programming|Cursussen informatica en programmeren
web.dev|https://web.dev/|إرشادات لتجارب ويب أفضل|Guidance for better web experiences|Richtlijnen voor betere webervaringen
JavaScript.info|https://javascript.info/|شرح متدرج للغة JavaScript|A structured JavaScript tutorial|Een gestructureerde JavaScript-handleiding
Frontend Mentor|https://www.frontendmentor.io/|تحديات تصميم وتطوير واجهات|Frontend design and coding challenges|Ontwerp- en programmeeruitdagingen
CSS-Tricks|https://css-tricks.com/|مقالات وتقنيات لتنسيق الويب|Articles and techniques for styling the web|Artikelen en technieken voor webopmaak
roadmap.sh|https://roadmap.sh/|خرائط مهارات للمطورين|Skill roadmaps for developers|Vaardigheidsroutes voor ontwikkelaars
Khan Academy|https://www.khanacademy.org/|دروس وتمارين في مجالات متنوعة|Lessons and exercises across subjects|Lessen en oefeningen in diverse vakken
MIT OpenCourseWare|https://ocw.mit.edu/|مواد جامعية مفتوحة|Open university course materials|Open universitair lesmateriaal
Exercism|https://exercism.org/|تمارين برمجية ومسارات لغات|Coding exercises and language tracks|Programmeeroefeningen en taalroutes
Learn Git Branching|https://learngitbranching.js.org/|تعلّم Git بصريًا وتفاعليًا|Learn Git through visual interaction|Leer Git met visuele interactie
SQLBolt|https://sqlbolt.com/|دروس تفاعلية في SQL|Interactive SQL lessons|Interactieve SQL-lessen
Refactoring Guru|https://refactoring.guru/|أنماط التصميم وتحسين الشيفرة|Design patterns and refactoring explained|Ontwerppatronen en refactoring uitgelegd
#create
Shadertoy|https://www.shadertoy.com/|معرض وتجارب للشيدر|A gallery and playground for shaders|Een galerij en speelplaats voor shaders
CodePen|https://codepen.io/|مختبر لتجارب الواجهات|A playground for frontend experiments|Een speelplaats voor frontend-experimenten
Three.js|https://threejs.org/|أمثلة وأدوات للرسم ثلاثي الأبعاد|Examples and tools for 3D graphics|Voorbeelden en gereedschappen voor 3D
Sketchfab|https://sketchfab.com/|عرض واستكشاف نماذج ثلاثية الأبعاد|View and explore 3D models|Bekijk en verken 3D-modellen
Blender|https://www.blender.org/|أدوات مفتوحة للإنتاج ثلاثي الأبعاد|Open tools for 3D production|Open gereedschappen voor 3D-productie
Figma Community|https://www.figma.com/community/|ملفات وموارد مجتمع التصميم|Community design files and resources|Ontwerpbestanden en gemeenschapsbronnen
Godot|https://godotengine.org/|محرك ألعاب مفتوح المصدر|An open-source game engine|Een opensource game-engine
Processing|https://processing.org/|برمجة إبداعية للفن المرئي|Creative coding for visual art|Creatief programmeren voor beeldende kunst
p5.js|https://p5js.org/|برمجة رسوم وتجارب تفاعلية|Code visual and interactive experiments|Programmeer visuele en interactieve experimenten
Observable|https://observablehq.com/|أدوات لاستكشاف البيانات وعرضها|Tools for exploring and presenting data|Gereedschappen voor verkenning en weergave van data
OpenProcessing|https://openprocessing.org/|مجتمع لتجارب البرمجة الإبداعية|A community for creative coding experiments|Een gemeenschap voor creatieve code-experimenten
itch.io|https://itch.io/|ألعاب ومشاريع مستقلة|Independent games and creative projects|Onafhankelijke spellen en creatieve projecten
Are.na|https://www.are.na/|تنظيم المراجع والأفكار البصرية|Organise references and visual ideas|Organiseer referenties en visuele ideeën
Dribbble|https://dribbble.com/|عرض واستكشاف أعمال التصميم|Showcase and explore design work|Toon en ontdek ontwerpwerk
Behance|https://www.behance.net/|معارض أعمال إبداعية|Portfolios of creative work|Portfolio’s van creatief werk
#world
Google Earth|https://earth.google.com/|استكشف الأرض عبر الخرائط|Explore the Earth through maps|Verken de aarde met kaarten
NASA Eyes|https://eyes.nasa.gov/|استكشاف مهمات وفضاء ثلاثي الأبعاد|Explore missions and space in 3D|Verken missies en de ruimte in 3D
Google Arts & Culture|https://artsandculture.google.com/|استكشاف مجموعات فنية وثقافية|Explore art and cultural collections|Verken kunst- en cultuurcollecties
Stellarium Web|https://stellarium-web.org/|خريطة تفاعلية لسماء الليل|An interactive map of the night sky|Een interactieve kaart van de nachtelijke hemel
Earth Nullschool|https://earth.nullschool.net/|عرض بصري للرياح وبيانات الأرض|Visualise winds and Earth data|Visualiseer wind en aardgegevens
Windy|https://www.windy.com/|خرائط طقس وطبقات متحركة|Weather maps and animated layers|Weerkaarten en bewegende lagen
Ventusky|https://www.ventusky.com/|استكشاف بيانات الطقس بصريًا|Explore weather data visually|Verken weergegevens visueel
MarineTraffic|https://www.marinetraffic.com/|خرائط لحركة السفن|Maps of vessel movements|Kaarten van scheepsbewegingen
Flightradar24|https://www.flightradar24.com/|متابعة حركة الطيران على الخريطة|Track air traffic on a map|Volg luchtverkeer op een kaart
Explore.org|https://explore.org/|كاميرات ومشاهد من الطبيعة|Nature cameras and scenes|Camera’s en beelden uit de natuur
Smithsonian|https://www.si.edu/|مجموعات ومتاحف ومحتوى معرفي|Collections, museums and learning resources|Collecties, musea en kennisbronnen
Zooniverse|https://www.zooniverse.org/|المشاركة في مشروعات علم مواطن|Participate in citizen-science projects|Doe mee aan burgerwetenschapsprojecten
Global Forest Watch|https://www.globalforestwatch.org/|خرائط وبيانات عن الغابات|Maps and data about forests|Kaarten en gegevens over bossen
Light Pollution Map|https://www.lightpollutionmap.info/|خريطة لاستكشاف التلوث الضوئي|A map for exploring light pollution|Een kaart voor lichtvervuiling
The True Size|https://www.thetruesize.com/|مقارنة مساحات الدول على الخريطة|Compare country sizes on a map|Vergelijk landen op een kaart
#calm
A Soft Murmur|https://asoftmurmur.com/|مزج أصوات محيطة هادئة|Mix quiet ambient sounds|Meng rustige omgevingsgeluiden
myNoise|https://mynoise.net/|مشاهد صوتية قابلة للتخصيص|Customisable soundscapes|Aanpasbare geluidslandschappen
Earth.fm|https://earth.fm/|تسجيلات أصوات الطبيعة|Recordings of natural soundscapes|Opnamen van natuurgeluiden
Noises Online|https://noises.online/|مزج أصوات في لوحة بسيطة|Mix sounds in a simple interface|Meng geluiden in een eenvoudige interface
Defonic|https://defonic.com/|أجواء صوتية للاسترخاء والتركيز|Ambient sound for rest and focus|Omgevingsgeluid voor rust en concentratie
Noisli|https://www.noisli.com/|أصوات وأدوات لتنظيم التركيز|Sounds and tools for focused sessions|Geluiden en hulpmiddelen voor concentratie
Ambient Mixer|https://www.ambient-mixer.com/|مجتمع للمشاهد الصوتية المحيطة|A community of ambient soundscapes|Een gemeenschap van omgevingsgeluiden
Rainy Mood|https://rainymood.com/|أجواء صوتية للمطر|A rain soundscape|Een geluidslandschap met regen
Lofi Cafe|https://www.lofi.cafe/|واجهة موسيقية بأجواء هادئة|A music interface with a relaxed atmosphere|Een muziekinterface met rustige sfeer
Tree.fm|https://tree.fm/|أصوات غابات من أماكن مختلفة|Forest sounds from different places|Bosgeluiden uit verschillende plaatsen
Drive & Listen|https://driveandlisten.app/|جولات قيادة مع محطات إذاعية|Driving journeys with radio stations|Rijtochten met radiozenders
I Miss My Cafe|https://imissmycafe.com/|بناء مشهد صوتي لمقهى|Build the soundscape of a café|Bouw het geluidslandschap van een café
I Miss My Library|https://imissmylibrary.com/|أجواء صوتية مستوحاة من المكتبة|A library-inspired soundscape|Een geluidslandschap als in een bibliotheek
Purrli|https://purrli.com/|صوت خرخرة قابل للتخصيص|A customisable purring sound|Een aanpasbaar spingeluid
Calmy Leon|https://calmyleon.com/|أصوات محيطة مولدة للاسترخاء|Generated ambient soundscapes|Gegenereerde omgevingsgeluiden
`;
let category='';
export const discoverySites:DiscoverySite[]=rows.trim().split('\n').flatMap(line=>{
 if(line.startsWith('#')){category=line.slice(1);return [];}
 const [name,url,ar,en,nl]=line.split('|');
 if(!url)return [];
 return [{id:new URL(url).hostname.replace(/^www\./,'').replace(/\W/g,'-')+'-'+category,name,url,category,description:text(ar,en,nl)}];
}).concat(costSites);
