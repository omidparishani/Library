"use client";

import { TAGS } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TagSelectorProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

export default function TagSelector({ value, onChange }: TagSelectorProps) {
  const toggle = (tag: string) => {
    if (value.includes(tag)) {
      onChange(value.filter((t) => t !== tag));
    } else {
      onChange([...value, tag]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {TAGS.map((tag) => {
        const selected = value.includes(tag.value);
        return (
          <button
            key={tag.value}
            type="button"
            onClick={() => toggle(tag.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2",
              selected
                ? `${tag.color} border-transparent scale-105 shadow-md`
                : "bg-white text-gray-600 border-gray-200 hover:border-sky-300"
            )}
          >
            {tag.value}
          </button>
        );
      })}
    </div>
  );
}
