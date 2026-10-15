import React, { useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import api from '../../api';

export const DocsUploadPage: React.FC = () => {
  const [dragging, setDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [category, setCategory] = useState('Lease');
  const [docName, setDocName] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) { setUploadedFile(file.name); setDocName(file.name); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setUploadedFile(file.name); setDocName(file.name); }
  };

  const handleSubmit = async () => {
    if (!uploadedFile) return;
    setIsUploading(true);
    try {
      await api.documents.create({
        name: docName || uploadedFile,
        category: category,
        fileUrl: `/uploads/${uploadedFile}`,
        fileSize: '1.2 MB',
        uploadedBy: 'Property Manager',
      });
      setUploaded(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 text-foreground max-w-2xl">
      <PageHeader
        title="Upload Center"
        description="Upload, tag, and categorise documents with property relationships and metadata."
        breadcrumbs={[{ label: 'Documents', href: '/documents' }, { label: 'Upload' }]}
      />

      {uploaded ? (
        <Card className="p-10 border bg-card flex flex-col items-center justify-center gap-4 text-center">
          <CheckCircle className="w-14 h-14 text-emerald-500" />
          <h3 className="font-extrabold text-lg">Upload Successful!</h3>
          <p className="text-sm text-muted-foreground">{uploadedFile} has been uploaded and indexed.</p>
          <Button onClick={() => { setUploaded(false); setUploadedFile(null); setDocName(''); }}>Upload Another</Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center gap-4 text-center transition cursor-pointer ${
              dragging ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/50 hover:bg-secondary/10'
            }`}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input id="file-input" type="file" className="hidden" onChange={handleFileChange} />
            {uploadedFile ? (
              <>
                <FileText className="w-12 h-12 text-primary" />
                <p className="font-bold text-sm">{uploadedFile}</p>
                <button onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }} className="text-rose-500 text-xs font-bold flex items-center gap-1"><X className="w-3 h-3" /> Remove</button>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-muted-foreground opacity-50" />
                <div>
                  <p className="font-extrabold text-sm">Drag & drop files here</p>
                  <p className="text-xs text-muted-foreground mt-1">or click to browse. Supports PDF, DOCX, XLSX, PNG</p>
                </div>
              </>
            )}
          </div>

          {/* Metadata Form */}
          <Card className="p-6 border bg-card space-y-4 text-xs font-semibold">
            <h3 className="font-extrabold uppercase text-sm border-b pb-2">Document Metadata</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Document Name</label>
                <Input value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="E.g., Lease_Agreement_Unit_304.pdf" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Category</label>
                <Select value={category} onChange={(e: any) => setCategory(e.target.value)}>
                  {['Lease','Invoice','Receipt','Statement','Inspection','Maintenance','Tax','Insurance','Contract','Legal','Other'].map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Related Property</label>
                <Input placeholder="E.g., Skyline Luxury Lofts" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Expiration Date</label>
                <Input type="date" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[80px] p-2.5 rounded-lg border bg-card text-foreground font-semibold"
                placeholder="Optional notes about this document..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => { setUploadedFile(null); setDocName(''); setDescription(''); }}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={!uploadedFile || isUploading}>
                <Upload className="w-4 h-4 mr-2" /> {isUploading ? 'Uploading...' : 'Upload Document'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
export default DocsUploadPage;
