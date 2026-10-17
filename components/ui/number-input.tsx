"use client";
import { useRef, useState, type ComponentProps } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { stepNumber } from "@/lib/numeric-input";

type Props = Omit<ComponentProps<typeof Input>, "type" | "value" | "onChange" | "step" | "min" | "max"> & {
  value: number; onValueChange: (value: number) => void; label: string; step?: number; min?: number; max?: number;
};
export function NumberInput({ value, onValueChange, label, step = 1, min = 0, max = Number.MAX_SAFE_INTEGER, disabled, ...props }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<string | null>(null);
  return <div className="number-control" role="group" aria-label={label}>
    <Button type="button" variant="unstyled" size="auto" aria-label={`${label} −`} disabled={disabled || value <= min} onClick={() => { setDraft(null); onValueChange(stepNumber(value, -1, step, min, max)); input.current?.focus(); }}>−</Button>
    <Input {...props} ref={input} type="number" value={draft ?? value} min={min} max={max} step={step} disabled={disabled} onBlur={event => { props.onBlur?.(event); if (event.currentTarget.value !== "") setDraft(null); }} onChange={event => {
      // Empty and partial values remain native editing states, never NaN in totals.
      setDraft(event.currentTarget.value);
      if (Number.isFinite(event.currentTarget.valueAsNumber)) onValueChange(event.currentTarget.valueAsNumber);
    }}/>
    <Button type="button" variant="unstyled" size="auto" aria-label={`${label} +`} disabled={disabled || value >= max} onClick={() => { setDraft(null); onValueChange(stepNumber(value, 1, step, min, max)); input.current?.focus(); }}>+</Button>
  </div>;
}
