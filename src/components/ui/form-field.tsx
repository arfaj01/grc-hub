"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

/* ─── Shared wrapper ─── */
interface WrapperProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

function FieldWrapper({ label, error, hint, required, className, children }: WrapperProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 mr-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

/* ─── Base input styles ─── */
const baseInput =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal transition-colors disabled:opacity-50 disabled:bg-gray-50";

/* ─── Text Input ─── */
interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, hint, required, wrapperClassName, className, ...props }, ref) => (
    <FieldWrapper label={label} error={error} hint={hint} required={required} className={wrapperClassName}>
      <input ref={ref} className={cn(baseInput, error && "border-red-300 focus:ring-red-200", className)} {...props} />
    </FieldWrapper>
  )
);
FormInput.displayName = "FormInput";

/* ─── Textarea ─── */
interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, hint, required, wrapperClassName, className, ...props }, ref) => (
    <FieldWrapper label={label} error={error} hint={hint} required={required} className={wrapperClassName}>
      <textarea ref={ref} rows={3} className={cn(baseInput, "resize-none", error && "border-red-300 focus:ring-red-200", className)} {...props} />
    </FieldWrapper>
  )
);
FormTextarea.displayName = "FormTextarea";

/* ─── Select ─── */
interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  wrapperClassName?: string;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, hint, required, options, placeholder, wrapperClassName, className, ...props }, ref) => (
    <FieldWrapper label={label} error={error} hint={hint} required={required} className={wrapperClassName}>
      <select ref={ref} className={cn(baseInput, "appearance-none", error && "border-red-300 focus:ring-red-200", className)} {...props}>
        {placeholder && (
          <option value="">
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  )
);
FormSelect.displayName = "FormSelect";

/* ─── Toggle switch row ─── */
interface FormToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function FormToggle({ label, checked, onChange, className }: FormToggleProps) {
  return (
    <label className={cn("flex items-center gap-3 cursor-pointer select-none group", className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-brand-teal/30",
          checked ? "bg-brand-teal border-brand-teal" : "bg-gray-200 border-gray-300"
        )}
      >
        <span
          className="pointer-events-none absolute top-0.5 block h-4 w-4 rounded-full bg-white shadow-sm transition-all"
          style={{ insetInlineStart: checked ? "calc(100% - 1.125rem)" : "1px" }}
        />
      </button>
      <span className="text-sm text-gray-700 group-hover:text-gray-900">{label}</span>
    </label>
  );
}

/* ─── Button ─── */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
  loading?: boolean;
}

export function Button({ variant = "primary", size = "md", loading, children, className, disabled, ...props }: ButtonProps) {
  const variants = {
    primary: "bg-brand-teal text-white hover:bg-brand-teal-deep shadow-sm",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
    danger: "bg-red-500 text-white hover:bg-red-600",
    ghost: "text-gray-500 hover:text-gray-700 hover:bg-gray-100",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
  };
  return (
    <button
      className={cn("font-medium rounded-xl transition-colors disabled:opacity-50", variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          جاري...
        </span>
      ) : (
        children
      )}
    </button>
  );
}

/* ─── Delete confirm dialog (simple) ─── */
interface ConfirmDeleteProps {
  open: boolean;
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function ConfirmDelete({ open, title, onConfirm, onCancel, loading }: ConfirmDeleteProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl mx-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-bold text-gray-900 mb-2">تأكيد الحذف</h3>
        <p className="text-sm text-gray-600 mb-5">
          هل أنت متأكد من حذف <span className="font-medium text-gray-900">{title}</span>؟ لا يمكن التراجع عن هذا الإجراء.
        </p>
        <div className="flex gap-2">
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            حذف
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            إلغاء
          </Button>
        </div>
      </div>
    </div>
  );
}
