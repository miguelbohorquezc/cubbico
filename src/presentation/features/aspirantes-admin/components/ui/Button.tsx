import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};
export function Button({ variant="ghost", className="", ...rest }: Props) {
  return <button className={`btn ${variant==="primary"?"btn--primary":"btn--ghost"} ${className}`} {...rest} />;
}
