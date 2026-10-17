import { z } from "zod";
import { roundedProduct } from "../decimal-rounding";
export const invoiceSchema = z.object({
 company:z.string().trim().min(2).max(160), customer:z.string().trim().min(2).max(160), number:z.string().trim().min(1).max(60),
 due:z.iso.date(),
 notes:z.string().max(1500).default(""), discount:z.number().min(0).max(100), vat:z.number().min(0).max(100),
 items:z.array(z.object({name:z.string().trim().min(1).max(160),quantity:z.number().min(0.01).max(10000),price:z.number().min(0).max(100000)})).min(1).max(20),
});
export type InvoiceInput=z.infer<typeof invoiceSchema>;
/** Unit prices retain input precision; only payable line totals round to cents. */
export function invoiceUnitPrice(value: number) {
 return `EUR ${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 20, useGrouping: false }).format(value)}`;
}
export function invoiceTotals(input:InvoiceInput) {
 const subtotal=input.items.reduce((sum,item)=>sum+roundedProduct(item.price,item.quantity,2),0);
 const discount=roundedProduct(subtotal,input.discount,-2);const net=subtotal-discount;const vat=roundedProduct(net,input.vat,-2);
 return {subtotal,discount,net,vat,total:net+vat};
}
