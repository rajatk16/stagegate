import { cn } from "cn";
import { ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";

const appearances = {
  info: {
    icon: Info,
    classes: "border-primary/25 bg-primary/5 text-foreground",
  },
  success: {
    icon: CircleCheck,
    classes:
      "border-emerald-600/30 bg-emerald-500/10 " +
      "text-emerald-800 dark:text-emerald-200",
  },
  warning: {
    icon: TriangleAlert,
    classes:
      "border-amber-600/30 bg-amber-500/10 " +
      "text-amber-900 dark:text-amber-200",
  },
  error: {
    icon: CircleAlert,
    classes: "border-destructive/30 bg-destructive/10 text-destructive",
  },
};

type InlineAlertProps = {
  tone?: keyof typeof appearances;
  title?: string;
  children: ReactNode;
  className?: string;
};

export const InlineAlert = ({
  tone = "info",
  title,
  children,
  className
}: InlineAlertProps) => {
  const { icon: Icon, classes } = appearances[tone];

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      aria-atomic="true"
      className={
        cn(
          "flex items-start gap-3 rounded-xl border p-4 text-sm",
          classes,
          className
        )
      }
    >
      <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />

      <div className="min-w-0 space-y-1">
        {title && <p className="font-semibold">{title}</p>}
        <div className="wrap-break-word">{children}</div>
      </div>
    </div>
  )
}
