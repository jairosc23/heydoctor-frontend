import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primaryLight",
        className,
      )}
      {...props}
    />
  );
});

export default Input;
