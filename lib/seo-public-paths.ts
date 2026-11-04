import { serviceSlugs } from "./service-catalog";
import { publishedWork, validWork } from "./public-work";

// Canonical public pages only. Pricing redirects to services;
// account, hosting dashboards, private reports, unfinished workflows, and empty portfolio are not indexable.
export const indexablePublicPaths = [
 "", "/services", ...(publishedWork.some(validWork) ? ["/work"] : []),
 "/contact", "/privacy", "/terms", "/services/company", "/services/apps", "/services/systems",
 ...serviceSlugs.map(slug => `/services/${slug}`),
];
