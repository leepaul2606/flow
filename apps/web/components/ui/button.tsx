"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "lg" | "md" | "sm";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-gold-gradient text-ink shadow-sm active:brightness-95 disabled:opacity-40",
  secondary:
    "border border-gold/45 text-ink bg-transparent active:bg-gold-wash/60 disabled:opacity-40",
  ghost: "text-gold active:bg-gold-wash/50 disabled:opacity-40",
  danger:
    "border border-negative/30 text-negative bg-transparent active:bg-negative/5 disabled:opacity-40",
};

const SIZES: Record<Size, string> = {
  lg: "h-14 px-6 text-base rounded-[var(--radius-field)]",
  md: "h-12 px-5 text-[15px] rounded-[var(--radius-field)]",
  sm: "h-10 px-4 text-sm rounded-full",
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  children: ReactNode;
  className?: string;
}

function classesFor({
  variant = "primary",
  size = "lg",
  fullWidth = true,
  className,
}: BaseProps): string {
  return cn(
    "inline-flex items-center justify-center gap-2 font-semibold",
    "transition-[filter,background-color] duration-150 select-none",
    "disabled:pointer-events-none",
    VARIANTS[variant],
    SIZES[size],
    fullWidth && "w-full",
    className,
  );
}

interface ButtonProps
  extends BaseProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> {}

export function Button({
  variant,
  size,
  fullWidth,
  loading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={classesFor({ variant, size, fullWidth, className, children })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}

interface ButtonLinkProps extends BaseProps {
  href: string;
  replace?: boolean;
}

export function ButtonLink({
  href,
  replace,
  variant,
  size,
  fullWidth,
  children,
  className,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      replace={replace}
      className={classesFor({ variant, size, fullWidth, className, children })}
    >
      {children}
    </Link>
  );
}

function Spinner() {
  return (
    <span
      className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent"
      role="status"
      aria-label="Loading"
    />
  );
}
