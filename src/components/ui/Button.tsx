import type { MouseEventHandler, ReactNode } from "react";

type ButtonProps = {
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  variant?: "default" | "ghost" | "light";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
};

export default function Button({
  children,
  onClick,
  variant = "default",
  className = "",
  disabled = false,
  type = "button",
}: ButtonProps) {
  const styles =
    variant === "ghost"
      ? "bg-transparent hover:bg-neutral-800/60"
      : variant === "light"
      ? "bg-neutral-100 text-neutral-900 hover:bg-white"
      : "bg-neutral-100/5 hover:bg-neutral-800";
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-xl border border-neutral-700 ${styles} ${className} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {children}
    </button>
  );
}
