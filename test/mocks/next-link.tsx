/**
 * Lightweight Next.js Link stub for component tests (no App Router runtime).
 */
import React from "react";

type LinkProps = React.PropsWithChildren<{
  href: string;
  className?: string;
  target?: string;
  rel?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}>;

export default function Link({
  href,
  children,
  className,
  target,
  rel,
  onClick,
}: LinkProps) {
  return (
    <a href={href} className={className} target={target} rel={rel} onClick={onClick}>
      {children}
    </a>
  );
}
