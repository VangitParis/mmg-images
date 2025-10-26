import type { MouseEventHandler, ReactNode } from "react";

type ButtonProps = {
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  variant?: "default" | "ghost" | "light";
  className?: string;
};

export default function Button({
  children,
  onClick,
  variant = "default",
  className = "",
}: ButtonProps) {
  const styles =
    variant === "ghost"
      ? "bg-transparent hover:bg-neutral-800/60"
      : variant === "light"
      ? "bg-neutral-100 text-neutral-900 hover:bg-white"
      : "bg-neutral-100/5 hover:bg-neutral-800";
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl border border-neutral-700 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}
