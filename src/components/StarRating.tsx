"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  readonly?: boolean;
}

export default function StarRating({
  value,
  onChange,
  size = 28,
  readonly = false,
}: StarRatingProps) {
  return (
    <div className="flex items-center gap-1" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={cn(
            "transition-transform",
            !readonly && "hover:scale-125 cursor-pointer",
            readonly && "cursor-default"
          )}
        >
          <Star
            size={size}
            className={cn(
              star <= value
                ? "fill-amber-400 text-amber-400"
                : "fill-none text-gray-300"
            )}
          />
        </button>
      ))}
    </div>
  );
}
