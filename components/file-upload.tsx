"use client";

import { useState, useRef } from "react";
import { uploadFile } from "@/actions/storage"; // Tera Storage Action
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { X, UploadCloud, Loader2, ImagePlus } from "lucide-react";
import Image from "next/image";

interface FileUploadProps {
  bucket: "avatars" | "documents";
  onUploadComplete: (url: string) => void; // Parent ko URL wapas dene ke liye
}

export function FileUpload({ bucket, onUploadComplete }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Progress simulation ke liye timer ref
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Validation (Sirf Images for Avatar)
    if (bucket === "avatars" && !file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG)");
      return;
    }

    // 2. Max Size Check (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
    }

    setUploading(true);
    setProgress(0);

    // 3. Fake Progress Bar Logic (User Experience ke liye)
    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90; // 90% pe ruk jao jab tak server haan na bole
        return prev + 10;
      });
    }, 500);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", bucket);

    try {
      // 4. Server Action Call
      const result = await uploadFile(formData);

      // Interval saaf karo
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }

      if (result.error) {
        toast.error(result.error);
        setProgress(0);
      } else if (result.url) {
        // Success!
        setProgress(100);
        toast.success("Upload complete!");
        onUploadComplete(result.url); // Parent ko URL batao
      }
    } catch (error) {
      toast.error("Upload failed. Try again.");
      setProgress(0);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-2 items-center w-full">
      
      {/* Hidden File Input + Custom Button */}
      <div className="relative group">
        <Input 
          type="file" 
          accept={bucket === "avatars" ? "image/*" : "*"}
          onChange={handleUpload}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
        />
        
        {/* Button UI */}
        <Button 
          type="button" 
          variant={uploading ? "ghost" : "outline"} 
          size="sm"
          className="relative z-10 pointer-events-none" // Events Input pe pass honge
        >
          {uploading ? (
             <>
               <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
             </>
          ) : (
             <>
               <ImagePlus className="mr-2 h-4 w-4" /> Change Photo
             </>
          )}
        </Button>
      </div>

      {/* Progress Bar (Sirf tab dikhega jab uploading ho rahi ho) */}
      {(uploading || progress > 0 && progress < 100) && (
        <div className="w-full max-w-[150px] space-y-1 animate-in fade-in zoom-in">
          <Progress value={progress} className="h-2" />
          <p className="text-[10px] text-center text-muted-foreground">{progress}%</p>
        </div>
      )}
    </div>
  );
}