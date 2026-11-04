import { notFound } from 'next/navigation';

// Keep unknown public URLs inside the localized layout and its 404 boundary.
export default function UnmatchedPage() {
  notFound();
}
