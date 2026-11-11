"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/cn";
import { Icon, type IconName } from "./icon";

interface FieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  label?: string;
  /** Leading gold icon inside the field, as on the login screen. */
  icon?: IconName;
  error?: string;
  hint?: string;
  trailing?: ReactNode;
  className?: string;
}

export function Field({
  label,
  icon,
  error,
  hint,
  trailing,
  className,
  id,
  ...props
}: FieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const describedBy = error
    ? `${fieldId}-error`
    : hint
      ? `${fieldId}-hint`
      : undefined;

  return (
    <div className={className}>
      {label ? (
        <label
          htmlFor={fieldId}
          className="mb-2 block text-[15px] font-medium text-ink"
        >
          {label}
        </label>
      ) : null}

      <div
        className={cn(
          "flex items-center gap-3 rounded-[var(--radius-field)]",
          "border bg-surface/50 px-4 h-[62px]",
          "focus-within:border-gold transition-colors",
          error ? "border-negative/60" : "border-hairline",
        )}
      >
        {icon ? (
          <span className="shrink-0 text-gold">
            <Icon name={icon} size={22} />
          </span>
        ) : null}

        <input
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "min-w-0 flex-1 bg-transparent text-ink outline-none",
            "placeholder:text-ink-faint",
          )}
          {...props}
        />

        {trailing ? <span className="shrink-0">{trailing}</span> : null}
      </div>

      {error ? (
        <p id={`${fieldId}-error`} className="mt-2 text-[13px] text-negative">
          {error}
        </p>
      ) : hint ? (
        <p id={`${fieldId}-hint`} className="mt-2 text-[13px] text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Password field with a show/hide toggle, matching the login mock. */
export function PasswordField(props: Omit<FieldProps, "type" | "trailing">) {
  const [visible, setVisible] = useState(false);

  return (
    <Field
      {...props}
      type={visible ? "text" : "password"}
      icon={props.icon ?? "lock"}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="text-ink-muted active:text-ink transition-colors"
        >
          <Icon name={visible ? "eye-off" : "eye"} size={22} />
        </button>
      }
    />
  );
}
