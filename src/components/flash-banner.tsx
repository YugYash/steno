import { cn } from "@/lib/utils";

type FlashBannerProps = {
  message?: string;
  kind?: "success" | "error" | "info";
  className?: string;
};

const styles = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-rose-200 bg-rose-50 text-rose-900",
  info: "border-sky-200 bg-sky-50 text-sky-900",
} as const;

export function FlashBanner({
  message,
  kind = "info",
  className,
}: FlashBannerProps) {
  if (!message) {
    return null;
  }

  return (
    <div className={cn("rounded-2xl border px-4 py-3 text-sm", styles[kind], className)}>
      {message}
    </div>
  );
}
