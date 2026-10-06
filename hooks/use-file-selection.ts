"use client";
import { useEffect, useRef, useState } from "react";
type Selection = { files: File[]; count: number; bytes: number; excluded: number; processed: number; total: number; preparing: boolean };
const empty: Selection = { files: [], count: 0, bytes: 0, excluded: 0, processed: 0, total: 0, preparing: false };
export function useFileSelection(allow: (file: File) => boolean, maxFiles: number) {
  const [selection, setSelection] = useState(empty);
  const generation = useRef(0);
  useEffect(() => () => { generation.current += 1; }, []);
  async function select(input: FileList | null) {
    if (!input?.length) return;
    const current = ++generation.current;
    const total = input.length;
    setSelection({ ...empty, total, preparing: true });
    // Yield before accessing the list so the preparing indicator can paint.
    await new Promise(resolve => setTimeout(resolve, 16));
    const files: File[] = []; const paths = new Set<string>();
    let count = 0; let bytes = 0; let excluded = 0;
    for (let start = 0; start < total; start += 200) {
      if (generation.current !== current) return;
      const end = Math.min(total, start + 200);
      for (let index = start; index < end; index++) {
        const file = input[index]; const path = file.webkitRelativePath || file.name;
        if (!allow(file) || paths.has(path)) { excluded += 1; continue; }
        paths.add(path); count += 1; bytes += file.size;
        // Count all accepted entries but retain a bounded list when over quota.
        if (files.length <= maxFiles) files.push(file);
      }
      setSelection({ files: [], count, bytes, excluded, processed: end, total, preparing: true });
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    if (generation.current === current) setSelection({ files, count, bytes, excluded, processed: total, total, preparing: false });
  }
  return { ...selection, select };
}
