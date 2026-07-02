import { UploadCloud } from 'lucide-react';
import { useCallback, useRef, useState, type DragEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatFileSize } from '../types/memory-upload';

const DEFAULT_MAX_FILE_SIZE = 20 * 1024 * 1024;

type MemoryDropzoneProps = {
  onFilesSelect: (files: File[]) => void;
  maxFileSize?: number;
  disabled?: boolean;
  className?: string;
};

function fileListToArray(fileList: FileList | null): File[] {
  if (!fileList) return [];
  return Array.from(fileList);
}

/**
 * Step 1 Dropzone — Card + hidden input + Button (createcapsule.md)
 */
export default function MemoryDropzone({
  onFilesSelect,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  disabled = false,
  className,
}: MemoryDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (disabled) return;
      const files = fileListToArray(fileList);
      if (files.length > 0) onFilesSelect(files);
    },
    [disabled, onFilesSelect],
  );

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  return (
    <Card
      className={cn(
        'border-dashed transition-colors',
        isDragging ? 'border-primary/60 bg-primary/5' : 'border-border',
        disabled && 'pointer-events-none opacity-60',
        className,
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardHeader>
        <CardTitle>Add files</CardTitle>
        <CardDescription>
          Photos, PDF, documents — up to {formatFileSize(maxFileSize)} each, multiple allowed
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3 py-2 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
          <UploadCloud className="h-6 w-6 text-primary" />
        </div>
        <p className="text-muted-foreground text-sm">Drag and drop files here</p>
        <Button type="button" variant="outline" disabled={disabled} onClick={() => inputRef.current?.click()}>
          Choose files
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          disabled={disabled}
          className="sr-only"
          accept="image/*,.pdf,.txt,.doc,.docx,.xls,.xlsx"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = '';
          }}
        />
      </CardContent>
    </Card>
  );
}
