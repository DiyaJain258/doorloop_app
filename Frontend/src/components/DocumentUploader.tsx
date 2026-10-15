import React from 'react';
import { FileUploader } from './FileUploader';
import { Card } from './ui/Card';
import { FileText, Download, Trash2, Calendar, HardDrive } from 'lucide-react';
import { Button } from './ui/Button';

interface UploadedDocument {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface DocumentUploaderProps {
  documents: UploadedDocument[];
  onUpload: (file: File) => void;
  onDelete?: (id: string) => void;
  title?: string;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  documents,
  onUpload,
  onDelete,
  title = 'Document Manager',
}) => {
  return (
    <Card className="p-6 border-border bg-card text-foreground space-y-6">
      <div className="flex items-center justify-between border-b pb-3">
        <h3 className="font-bold text-base uppercase tracking-wide flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-primary" />
          {title}
        </h3>
        <span className="text-xs font-semibold text-muted-foreground">
          {documents.length} Files Uploaded
        </span>
      </div>

      {/* Upload Zone */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-muted-foreground uppercase">Upload New File</label>
        <FileUploader onFileSelect={onUpload} accept="application/pdf,image/*,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
      </div>

      {/* Files List */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-muted-foreground uppercase">File Vault</label>
        {documents.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground text-xs font-medium italic">
            No files uploaded yet. Drag a file above to begin.
          </div>
        ) : (
          <div className="divide-y border rounded-lg overflow-hidden bg-card/40">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3.5 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold truncate max-w-[180px] sm:max-w-xs text-foreground">
                      {doc.name}
                    </p>
                    <div className="flex items-center space-x-2 text-[10px] text-muted-foreground font-semibold mt-0.5">
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5">
                        <Calendar className="w-3 h-3" />
                        {doc.uploadedAt}
                      </span>
                      <span>•</span>
                      <span>By {doc.uploadedBy}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => onDelete(doc.id)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
export default DocumentUploader;
