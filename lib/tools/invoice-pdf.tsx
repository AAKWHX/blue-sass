import "server-only";
import path from "node:path";
import { Document, Page, View, Text, Font, renderToBuffer } from "@react-pdf/renderer";
import { invoiceTotals, type InvoiceInput } from "./invoice";
import { businessUi } from "../i18n/business-ui";
import type { Locale } from "../i18n/config";
for(const name of ["Cairo","NotoSans","NotoSansSC","NotoSansJP","NotoSansKR"])Font.register({family:name,src:path.join(process.cwd(),"public","report-fonts",`${name}-Regular.ttf`)});
Font.registerHyphenationCallback(word=>[word]);
export async function invoicePdf(input:InvoiceInput,locale:Locale){
 const c=businessUi(locale);const totals=invoiceTotals(input);const money=(value:number)=>`EUR ${(value/100).toFixed(2)}`;
 const fontFamily=locale==="ar"?"Cairo":locale==="zh"?"NotoSansSC":locale==="ja"?"NotoSansJP":locale==="ko"?"NotoSansKR":"NotoSans";
 return renderToBuffer(<Document title={input.number} author={input.company}><Page size="A4" style={{padding:40,paddingBottom:70,fontFamily,fontSize:11,lineHeight:1.6,direction:locale==="ar"?"rtl":"ltr",textAlign:locale==="ar"?"right":"left"}}>
 <Text style={{fontSize:24,marginBottom:15}}>{input.company}</Text><Text>{c.invoiceNumber}: {input.number}</Text><Text>{c.customer}: {input.customer}</Text><Text>{c.due}: {input.due}</Text>
 <View style={{marginTop:22}}>{input.items.map((item,i)=><View wrap={false} key={i} style={{borderBottomWidth:1,borderBottomColor:"#ddd",paddingVertical:9}}><Text>{item.name}</Text><Text style={{fontFamily:"NotoSans",fontSize:10}}>{item.quantity} × {money(Math.round(item.price*100))} = {money(Math.round(item.quantity*item.price*100))}</Text></View>)}</View>
 <View wrap={false} style={{marginTop:22}}><Text>{c.discount}: {money(totals.discount)} ({input.discount}%)</Text><Text>{c.vat}: {money(totals.vat)} ({input.vat}%)</Text><Text style={{fontSize:18,marginTop:8}}>{c.total}: {money(totals.total)}</Text></View>
 {input.notes&&<Text style={{marginTop:22}}>{c.notes}: {input.notes}</Text>}
 <Text fixed render={({pageNumber,totalPages})=>`Created with Blue Sass · www.bluesass.nl · ${pageNumber}/${totalPages}`} style={{position:"absolute",bottom:28,left:40,right:40,fontFamily:"NotoSans",fontSize:8,color:"#555",direction:"ltr",textAlign:"center"}}/>
 </Page></Document>);
}
