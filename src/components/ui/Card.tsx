import type { ReactNode } from "react";

type CardProps = {
  children?: ReactNode;
  className?: string;
};

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-3xl bg-neutral-900/60 border border-neutral-800 shadow-2xl ${className}`}>
      {children}
    </div>
  );
}
