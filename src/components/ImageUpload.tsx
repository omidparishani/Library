"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Camera, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface ImageUploadProps {
  images: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({
  images,
  onChange,
  maxImages = 4,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast.error(`حداکثر ${maxImages} عکس می‌تونی آپلود کنی 😊`);
      return;
    }

    setUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          toast.error("حجم عکس نباید بیشتر از ۵ مگابایت باشه");
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "آپلود ناموفق بود");
        }

        const data = await res.json();
        newUrls.push(data.url);
      }

      if (newUrls.length > 0) {
        onChange([...images, ...newUrls]);
        toast.success("عکس‌ها با موفقیت اضافه شدن! 🎉");
      }
    } catch (err: any) {
      toast.error(err.message || "مشکلی پیش اومد");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeImage = (url: string) => {
    onChange(images.filter((img) => img !== url));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {images.map((url) => (
          <div key={url} className="relative w-24 h-24 rounded-2xl overflow-hidden group">
            <Image src={url} alt="cover" fill className="object-cover" />
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-24 h-24 rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50 flex flex-col items-center justify-center gap-1 text-sky-500 hover:bg-sky-100 hover:border-sky-400 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <>
                <Camera size={24} />
                <span className="text-xs font-medium">افزودن</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
}
