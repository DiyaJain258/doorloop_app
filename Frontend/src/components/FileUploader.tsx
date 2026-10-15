import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { clsx } from 'clsx';

interface FileUploaderProps {
  onFileSelect?: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  accept = '*/*',
  maxSizeMB = 10,
  className,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setError(null);
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File is too large. Max size is ${maxSizeMB}MB.`);
      return;
    }

    setSelectedFile(file);
    setUploading(true);
    setProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          if (onFileSelect) onFileSelect(file);
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setProgress(0);
    setError(null);
  };

  const triggerInput = () => {
    inputRef.current?.click();
  };

  return (
    <div className={clsx('w-full', className)}>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleChange}
      />

      {!selectedFile && !error && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerInput}
          className={clsx(
            'flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all duration-200',
            dragActive
              ? 'border-primary bg-primary/5 scale-[0.99]'
              : 'border-border bg-card/40 hover:bg-card/75 hover:border-primary/50'
          )}
        >
          <UploadCloud className="w-10 h-10 text-muted-foreground mb-3 animate-pulse-slow" />
          <p className="text-sm font-medium text-foreground">
            Drag & drop your file here, or{' '}
            <span className="text-primary font-semibold hover:underline">browse</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Supports PDF, DOCX, PNG, JPG (Max {maxSizeMB}MB)
          </p>
        </div>
      )}

      {selectedFile && (
        <div className="flex items-center justify-between border border-border bg-card rounded-lg p-4 animate-fade-in">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="bg-primary/10 text-primary p-2 rounded">
              <FileText className="w-6 h-6" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate max-w-[200px] md:max-w-xs text-foreground">
                {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>

              {uploading && (
                <div className="w-48 bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!uploading && (
              <CheckCircle className="w-5 h-5 text-emerald-500 animate-bounce" />
            )}
            <button
              onClick={removeFile}
              className="text-muted-foreground hover:text-destructive p-1 rounded-full hover:bg-muted"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between border border-rose-200 dark:border-rose-950 bg-rose-50 dark:bg-rose-950/20 rounded-lg p-4 text-rose-600 dark:text-rose-400">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <button
            onClick={removeFile}
            className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};
export default FileUploader;
