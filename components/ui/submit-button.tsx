"use client";
import {useFormStatus} from "react-dom";
import {Button} from "./button";
import type {ComponentProps} from "react";
export function SubmitButton({children,disabled,...props}:ComponentProps<typeof Button>){const {pending}=useFormStatus();return <Button {...props} type="submit" disabled={disabled||pending} aria-busy={pending}>{pending?<><span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true"/>{children}</>:children}</Button>;}
