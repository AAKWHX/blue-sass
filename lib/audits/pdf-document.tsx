import { Document, Page, View, Text as PdfText, Font, StyleSheet, Svg, Rect, Path, renderToBuffer, type TextProps } from "@react-pdf/renderer";
import type { PropsWithChildren } from "react";
import path from "node:path";
import type { AuditReport, AuditCategory } from "./types";
import type { Locale } from "@/lib/i18n/config";
import { platformCopy } from "@/lib/i18n/platform-tools";

const names = ["Cairo", "NotoSans", "NotoSansSC", "NotoSansJP", "NotoSansKR"];
for(const name of names) Font.register({family:name,src:path.join(process.cwd(),"public","report-fonts",`${name}-Regular.ttf`)});
Font.registerHyphenationCallback(word=>[word]);
function Text({locale,style,...props}:PropsWithChildren<TextProps> & {locale:Locale}){
  const direction=locale==="ar"?"rtl":"ltr";
  return <PdfText {...props} style={[{direction},...(Array.isArray(style)?style:style?[style]:[])]}/>;
}
const styles=StyleSheet.create({
  page:{paddingTop:88,paddingBottom:60,paddingHorizontal:38,fontSize:10,lineHeight:1.65,color:"#101216",backgroundColor:"#fff"},
  header:{position:"absolute",top:25,left:38,right:38,height:46,flexDirection:"row",justifyContent:"space-between",alignItems:"center",borderBottomWidth:1,borderBottomColor:"#aeb6bf",paddingBottom:10},
  footer:{position:"absolute",height:24,bottom:22,left:38,right:38,fontSize:8,flexDirection:"row",justifyContent:"space-between",borderTopWidth:1,borderTopColor:"#aeb6bf",paddingTop:8},
  title:{fontSize:23,marginBottom:20}, heading:{fontSize:16,marginBottom:15}, small:{fontSize:8,color:"#515865"},
  block:{padding:12,marginBottom:12,borderWidth:1,borderColor:"#dde2e8",borderRadius:6},
  finding:{padding:12,marginBottom:12,borderWidth:1,borderColor:"#dde2e8",borderLeftWidth:3},
  rowTitle:{fontSize:12,marginBottom:5}, caption:{fontSize:9,marginTop:7,color:"#515865"}, body:{marginTop:4},
});
const categories: AuditCategory[]=["security","seo","accessibility","performance","links","source"];
const urgent=new Set(["secret_indicators","dynamic_execution","html_injection_review","tls_disabled"]);
function Logo(){return <Svg width={34} height={34} viewBox="0 0 64 64"><Rect x="2" y="2" width="60" height="60" rx="18" fill="#080808" stroke="#aeb6bf" strokeWidth={2}/><Path d="M19 15h15c7 0 11 3.4 11 8.6 0 3.3-1.7 5.9-4.8 7.3 4.2 1.2 6.5 4.2 6.5 8.3 0 6.1-5 9.8-12.9 9.8H19V15Zm14 13.3c3.3 0 5.2-1.3 5.2-3.7 0-2.4-1.9-3.6-5.2-3.6h-6.8v7.3H33Zm.8 14.7c3.8 0 5.9-1.5 5.9-4.3 0-2.7-2.1-4.1-5.9-4.1h-7.6V43h7.6Z" fill="#e8ecf0"/></Svg>;}
export function AuditPdfDocument({id,report,locale}:{id:string;report:AuditReport;locale:Locale}){
  const c=platformCopy(locale);const d=c.auditDetails;
  const family=locale==="ar"?"Cairo":locale==="zh"?"NotoSansSC":locale==="ja"?"NotoSansJP":locale==="ko"?"NotoSansKR":"NotoSans";
  const align=locale==="ar"?"right" as const:"left" as const;
  const pageStyle={...styles.page,fontFamily:family,textAlign:align};
  const header=<View style={styles.header} fixed><View style={{flexDirection:"row",alignItems:"center",gap:10}}><Logo/><View><Text locale={locale} style={{fontSize:15,fontFamily:"NotoSans"}}>Blue Sass</Text><Text locale={locale} style={styles.small}>{d.publisher}</Text></View></View><View><Text locale={locale} style={{fontFamily:"NotoSans",fontSize:8}}>www.bluesass.nl</Text><Text locale={locale} style={{fontFamily:"NotoSans",fontSize:8}}>help@bluesass.nl</Text></View></View>;
  const footer=<><View style={styles.footer} fixed><Text locale={locale} style={{fontFamily:"NotoSans",fontSize:8,lineHeight:1.3,width:200,height:16,flexShrink:0,direction:"ltr",color:"#101216"}}>Blue Sass | {id.slice(0,8)}</Text></View><PdfText fixed render={({pageNumber,totalPages})=>`${pageNumber} / ${totalPages}`} style={{position:"absolute",bottom:24,right:38,width:80,fontFamily:"NotoSans",fontSize:8,lineHeight:1.3,direction:"ltr",textAlign:"right",color:"#101216"}}/></>;
  return <Document title={`Blue Sass - ${c.report}`} author="Blue Sass" subject={report.target} language={locale}>
    <Page size="A4" style={pageStyle}>{header}{footer}<Text locale={locale} style={styles.title}>{c.report}</Text><Text locale={locale}>{report.pageUrl??report.target}</Text><Text locale={locale} style={styles.caption}>{d.generated}</Text><Text locale={locale} style={{fontFamily:"NotoSans",fontSize:9}}>{report.generatedAt.slice(0,19).replace("T"," ")} UTC</Text><Text locale={locale} style={styles.caption}>{d.reportId}</Text><Text locale={locale} style={{fontFamily:"NotoSans",fontSize:8,marginBottom:18}}>{id}</Text>
      <View style={styles.block}><Text locale={locale} style={styles.rowTitle}>{d.scope}</Text><Text locale={locale}>{d.conclusion}</Text><Text locale={locale} style={styles.body}>{d.pageCount}: {report.fetchedPages} | {d.sourceCount}: {report.scannedFiles} | {c.ignored}: {report.skippedFiles}</Text></View>
      <View style={styles.block}>{["pass","warning","not_tested"].map(status=><Text locale={locale} key={status}>{status==="pass"?d.passed:status==="warning"?c.warning:d.untested}: {report.checks.filter(check=>check.status===status).length}</Text>)}</View>
      {report.source==="url" && <View style={styles.block}><Text locale={locale} style={styles.rowTitle}>{d.pages}</Text>{report.pages?.length?report.pages.map((page,index)=><View key={index} style={{marginTop:8}}><Text locale={locale} style={{fontFamily:"NotoSans",fontSize:8}}>{page.url}</Text><Text locale={locale} style={{fontFamily:"NotoSans",fontSize:8}}>{page.method} | {page.status===null?"No response":`HTTP ${page.status}`}</Text></View>):<Text locale={locale}>{d.historical}</Text>}</View>}
      <Text locale={locale} style={styles.small}>{c.privacy}</Text>
    </Page>
    {categories.map(category=>{const checks=report.checks.filter(row=>row.category===category);if(!checks.length)return null;return <Page key={category} size="A4" style={pageStyle}>{header}{footer}<Text locale={locale} style={styles.heading}>{c.categories[category]}</Text>{checks.map((row,index)=>{const warning=row.status==="warning";const high=warning&&urgent.has(row.code);const next=c.recommendations[row.code as keyof typeof c.recommendations];return <View key={index} wrap={false} style={{...styles.finding,borderLeftColor:row.status==="not_tested"?"#68717e":high?"#b42318":warning?"#a15c00":"#23854a",backgroundColor:high?"#fff1f0":warning?"#fff8e8":row.status==="not_tested"?"#f3f4f6":"#f1faf4"}}>
      <Text locale={locale} style={styles.rowTitle}>{c.rules[row.code as keyof typeof c.rules]??row.code}</Text><Text locale={locale} style={styles.small}>{row.status==="not_tested"?d.untested:high?d.high:warning?c.warning:row.metric!==undefined?d.metric:d.passed}</Text>
      {row.file && <Text locale={locale} style={{fontFamily:["NotoSans","Cairo","NotoSansSC","NotoSansJP","NotoSansKR"],fontSize:8,marginTop:4,direction:"ltr"}}>{row.file}</Text>}
      <Text locale={locale} style={styles.caption}>{d.methodology}</Text><Text locale={locale}>{d.methods[row.code as keyof typeof d.methods]??c.limits}</Text>
      {row.count!==undefined && <Text locale={locale} style={styles.body}>{d.count}: {row.count}</Text>}{row.metric!==undefined && <Text locale={locale} style={styles.body}>{d.evidence}: {row.metric} {row.code==="html_fetch_ms"?d.milliseconds:row.code==="html_bytes"?d.bytes:""}</Text>}
      {warning&&next && <><Text locale={locale} style={styles.caption}>{d.next}</Text><Text locale={locale}>{next}</Text></>}
    </View>;})}</Page>;})}
  </Document>;
}
export async function renderAuditPdf(id:string,report:AuditReport,locale:Locale){
  return renderToBuffer(<AuditPdfDocument id={id} report={report} locale={locale}/>);
}
