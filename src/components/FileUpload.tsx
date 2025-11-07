import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileCode } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  onFileLoad: (content: string, filename: string) => void;
}

export const FileUpload = ({ onFileLoad }: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file extension
    if (!file.name.endsWith(".c") && !file.name.endsWith(".h")) {
      toast.error("Please upload a C file (.c or .h)");
      return;
    }

    // Check file size (max 1MB)
    if (file.size > 1024 * 1024) {
      toast.error("File size must be less than 1MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileLoad(content, file.name);
      toast.success(`Loaded ${file.name}`);
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
    };
    reader.readAsText(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const mockEvent = {
        target: { files: [file] },
      } as any;
      handleFileChange(mockEvent);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <Card
      className="border-2 border-dashed border-primary/30 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all cursor-pointer group"
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="p-6 flex flex-col items-center gap-3 text-center">
        <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
          <FileCode className="h-8 w-8 text-primary" />
        </div>
        <div>
          <p className="font-medium text-foreground">Upload C File</p>
          <p className="text-sm text-muted-foreground mt-1">
            Click or drag & drop your .c or .h file here
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="h-4 w-4" />
          Choose File
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".c,.h"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </Card>
  );
};
