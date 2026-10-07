export const listingKinds=["job","project","product"] as const;
export type ListingKind=typeof listingKinds[number];
export const jobTiers={basic:{price:0,label:"Basic",rank:0},featured:{price:29,label:"Featured",rank:1},premium:{price:79,label:"Premium",rank:2},urgent:{price:149,label:"Urgent / Hiring",rank:3}} as const;
export type JobTier=keyof typeof jobTiers;
export function commerceOrderPrice(kind:string,snapshot:{price:number;tier:string}){
 if(!Number.isInteger(snapshot.price)||snapshot.price<1||snapshot.price>100000)throw Error("INVALID_ORDER_PRICE");
 if(kind==="job"&&jobTiers[snapshot.tier as JobTier]?.price!==snapshot.price)throw Error("INVALID_ORDER_PRICE");
 if(!["job","product"].includes(kind))throw Error("INVALID_ORDER_PRICE");return snapshot.price*100;
}
export const listingCategories=["Developer","Designer","Marketing","AI","Cybersecurity","Templates","UI Kits","Business Documents","Website Components","Automation Templates","AI Prompts","Starter Projects"] as const;
export function listingActive(status:string,kind:string,tier:string,moderatedAt:Date|null,paidAt:Date|null,now=new Date()){
 if(status!=="approved"||!moderatedAt)return false;
 if(kind!=="job")return true;
 const start=tier==="basic"?moderatedAt:paidAt?new Date(Math.max(moderatedAt.getTime(),paidAt.getTime())):null;
 return !!start&&now.getTime()<start.getTime()+30*86_400_000;
}
