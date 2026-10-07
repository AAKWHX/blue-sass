import { z } from "zod";
export const invoiceSchema = z.object({
 company:z.string().trim().min(2).max(160), customer:z.string().trim().min(2).max(160), number:z.string().trim().min(1).max(60),
 due:z.iso.date(),
 notes:z.string().max(1500).default(""), discount:z.number().min(0).max(100), vat:z.number().min(0).max(100),
 items:z.array(z.object({name:z.string().trim().min(1).max(160),quantity:z.number().min(0.01).max(10000),price:z.number().min(0).max(100000)})).min(1).max(20),
});
export type InvoiceInput=z.infer<typeof invoiceSchema>;
export function invoiceTotals(input:InvoiceInput) {
 const subtotal=input.items.reduce((sum,item)=>sum+Math.round(item.price*100*item.quantity),0);
 const discount=Math.round(subtotal*input.discount/100);const net=subtotal-discount;const vat=Math.round(net*input.vat/100);
 return {subtotal,discount,net,vat,total:net+vat};
}
