const response=await fetch('https://www.bluesass.nl/ar/services');
const html=await response.text();
const paths=[...html.matchAll(/(?:src|srcSet)="([^"]+)"/g)].map(m=>m[1]).filter(s=>/service-|media/.test(s));
console.log(JSON.stringify({status:response.status,paths:[...new Set(paths)]},null,2));
