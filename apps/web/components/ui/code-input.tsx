"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";

import { cn } from "@/lib/cn";

/**
 * Six-box digit entry, used for SMS/email verification codes and passcodes.
 *
 * A single offscreen input holds the value so mobile keyboards, SMS
 * autofill (autoComplete="one-time-code") and paste all behave normally —
 * six separate inputs break every one of those.
 */
export function CodeInput({
  length = 6,
  value,
  onChange,
  onComplete,
  /** Renders dots instead of digits, for passcode entry. */
  secure = false,
  autoFocus = true,
  disabled = false,
  invalid = false,
  label = "Verification code",
}: {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  secure?: boolean;
  autoFocus?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const completedFor = useRef<string | null>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Fire onComplete once per full code, not on every re-render at full length
  useEffect(() => {
    if (value.length === length && completedFor.current !== value) {
      completedFor.current = value;
      onComplete?.(value);
    }
    if (value.length < length) {
      completedFor.current = null;
    }
  }, [value, length, onComplete]);

  const setFromRaw = useCallback(
    (raw: string) => {
      const digits = raw.replace(/\D/g, "").slice(0, length);
      onChange(digits);
    },
    [length, onChange],
  );

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    setFromRaw(event.clipboardData.getData("text"));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    // Keep the caret pinned to the end so edits always append/truncate
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
    }
  };

  const activeIndex = Math.min(value.length, length - 1);

  return (
    <div
      className="relative"
      onClick={() => inputRef.current?.focus()}
      role="presentation"
    >
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        aria-label={label}
        value={value}
        disabled={disabled}
        maxLength={length}
        onChange={(e) => setFromRaw(e.target.value)}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        // Visually hidden but still focusable and able to raise the keyboard
        className="absolute inset-0 z-10 size-full opacity-0"
      />

      <div className="flex justify-between gap-2.5" aria-hidden="true">
        {Array.from({ length }).map((_, index) => {
          const char = value[index];
          const isActive = focused && index === activeIndex && !disabled;

          return (
            <div
              key={index}
              className={cn(
                "flex h-[70px] flex-1 items-center justify-center",
                "rounded-[var(--radius-field)] border bg-surface/40",
                "text-[24px] font-medium text-ink tabular",
                "transition-colors duration-150",
                invalid
                  ? "border-negative/60"
                  : isActive
                    ? "border-gold"
                    : "border-hairline",
              )}
            >
              {char ? (
                secure ? (
                  <span className="size-3 rounded-full bg-ink" />
                ) : (
                  char
                )
              ) : isActive ? (
                <span className="h-7 w-px animate-pulse bg-gold" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
