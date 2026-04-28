import Link from "next/link";
import { cn } from "@/lib/utils";

const base =
  "inline-flex items-center justify-center rounded-xl px-6 py-3 text-center font-semibold transition-all duration-[180ms] ease hover:scale-[1.02] active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50 disabled:hover:scale-100";

const variants = {
  primary:
    "bg-gradient-to-r from-primaryMid to-primary text-white shadow-soft hover:shadow-premium",
  secondary:
    "border border-gray-300 bg-white text-gray-700 shadow-none hover:bg-gray-50",
} as const;

export type ButtonVariant = keyof typeof variants;

type ButtonOwnProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
  href?: string;
  /** Solo aplica cuando hay `href` (p. ej. enlaces externos `target="_blank"`). */
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
};

export type ButtonProps = ButtonOwnProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonOwnProps>;

export default function Button({
  children,
  variant = "primary",
  className,
  href,
  target,
  rel,
  type = "button",
  disabled,
  ...props
}: ButtonProps) {
  const cls = cn(base, variants[variant], className);

  if (href && !disabled) {
    return (
      <Link href={href} className={cls} target={target} rel={rel}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={cls} disabled={disabled} {...props}>
      {children}
    </button>
  );
}
