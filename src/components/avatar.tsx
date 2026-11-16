import { useState } from "react";

export function Avatar({
  src,
  name,
  className,
}: {
  src: string;
  name: string;
  className: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <span
        className={`inline-flex items-center justify-center bg-surface font-display text-accent ${className}`}
        aria-hidden="true"
      >
        {name.slice(0, 1).toUpperCase()}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt=""
      className={`object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
