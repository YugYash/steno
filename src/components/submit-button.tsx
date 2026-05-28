"use client";

import { useFormStatus } from "react-dom";

import { cn } from "@/lib/utils";

type SubmitButtonProps = {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
};

export function SubmitButton({
  children,
  pendingLabel = "Working...",
  className,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex items-center justify-center rounded-[56px] bg-cb-blue px-6 py-3.5 text-base font-semibold text-white tracking-[0.16px] transition-all duration-200 hover:bg-cb-hover focus:outline-none focus:ring-2 focus:ring-cb-dark disabled:cursor-not-allowed disabled:bg-slate-300",
        className,
      )}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
