import { serviceSlugs } from "./service-catalog";
import { toolIds } from "./tools/catalog";

// Canonical public pages only. Pricing/templates redirect to services;
// account, hosting dashboards, private reports and previews are not indexable.
export const indexablePublicPaths = [
 "", "/about", "/services", "/subscriptions", "/projects", "/reviews",
 "/contact", "/create-project", "/privacy", "/terms", "/tools", "/jobs",
 "/products", "/marketplace", "/services/company", "/services/apps", "/services/systems",
 ...toolIds.map(id => `/tools/${id}`),
 ...serviceSlugs.map(slug => `/services/${slug}`),
];
