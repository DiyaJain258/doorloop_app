import React, { useRef, useState, useEffect } from 'react';
import { FormDialog } from './FormDialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Eraser, PenTool, Type, Upload, Check } from 'lucide-react';
import { clsx } from 'clsx';

interface SignaturePadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveSignature: (signatureDataUrl: string, typedName?: string) => void;
  defaultName?: string;
}

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  open,
  onOpenChange,
  onSaveSignature,
  defaultName = 'Sarah Davis',
}) => {
  const [activeTab, setActiveTab] = useState<'draw' | 'type' | 'upload'>('draw');
  const [penColor, setPenColor] = useState<'#0f172a' | '#1e40af'>('#1e40af'); // Dark slate or Blue ink
  const [typedName, setTypedName] = useState(defaultName);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Canvas State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const historyStack = useRef<ImageData[]>([]);

  // Initialize Canvas
  useEffect(() => {
    if (open && activeTab === 'draw') {
      setTimeout(initCanvas, 50);
    }
  }, [open, activeTab]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high resolution
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = penColor;

    // Save initial blank state
    historyStack.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.strokeStyle = penColor;
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      historyStack.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    historyStack.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Convert typed name to canvas Data URL
  const generateTypedSignatureDataUrl = (): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = penColor;
    ctx.font = 'italic bold 52px "Brush Script MT", "Dancing Script", cursive, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedName || 'Signer', canvas.width / 2, canvas.height / 2 - 10);

    // Baseline decorative rule line
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, canvas.height / 2 + 40);
    ctx.lineTo(canvas.width - 80, canvas.height / 2 + 40);
    ctx.stroke();

    return canvas.toDataURL('image/png');
  };

  const handleAdoptAndSave = () => {
    let finalDataUrl = '';

    if (activeTab === 'draw') {
      const canvas = canvasRef.current;
      if (canvas) {
        finalDataUrl = canvas.toDataURL('image/png');
      }
    } else if (activeTab === 'type') {
      finalDataUrl = generateTypedSignatureDataUrl();
    } else if (activeTab === 'upload' && uploadedImage) {
      finalDataUrl = uploadedImage;
    }

    if (finalDataUrl) {
      onSaveSignature(finalDataUrl, typedName);
      onOpenChange(false);
    }
  };

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title="Create Your Digital Signature">
      <div className="space-y-4 pt-1 text-foreground font-semibold">
        {/* Mode Tabs */}
        <div className="flex border-b border-border/60 pb-3 gap-2">
          <button
            onClick={() => setActiveTab('draw')}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition',
              activeTab === 'draw' ? 'bg-primary text-white shadow-sm' : 'bg-secondary/20 hover:bg-secondary/40 text-muted-foreground'
            )}
          >
            <PenTool className="w-3.5 h-3.5" /> Draw
          </button>
          <button
            onClick={() => setActiveTab('type')}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition',
              activeTab === 'type' ? 'bg-primary text-white shadow-sm' : 'bg-secondary/20 hover:bg-secondary/40 text-muted-foreground'
            )}
          >
            <Type className="w-3.5 h-3.5" /> Type Name
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition',
              activeTab === 'upload' ? 'bg-primary text-white shadow-sm' : 'bg-secondary/20 hover:bg-secondary/40 text-muted-foreground'
            )}
          >
            <Upload className="w-3.5 h-3.5" /> Upload Image
          </button>
        </div>

        {/* --- TAB 1: DRAW CANVAS --- */}
        {activeTab === 'draw' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Draw using Mouse or Touch Pad</span>
              <div className="flex gap-2 items-center">
                <span className="text-[10px] font-bold text-muted-foreground">Ink:</span>
                <button
                  type="button"
                  onClick={() => setPenColor('#1e40af')}
                  className={clsx('w-5 h-5 rounded-full bg-blue-800 border-2 transition', penColor === '#1e40af' ? 'border-primary ring-2 ring-primary/30' : 'border-transparent')}
                  title="Blue Ink"
                />
                <button
                  type="button"
                  onClick={() => setPenColor('#0f172a')}
                  className={clsx('w-5 h-5 rounded-full bg-slate-900 border-2 transition', penColor === '#0f172a' ? 'border-primary ring-2 ring-primary/30' : 'border-transparent')}
                  title="Black Ink"
                />
              </div>
            </div>

            <div className="relative border-2 border-dashed border-border/70 rounded-2xl bg-white dark:bg-slate-950 p-2 shadow-inner">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-44 cursor-crosshair rounded-xl touch-none bg-slate-50/50 dark:bg-slate-900/50"
              />
              {!hasDrawn && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs font-bold opacity-60">
                  Draw signature here...
                </div>
              )}
              <div className="absolute bottom-4 left-6 right-6 border-b border-slate-300 dark:border-slate-700 pointer-events-none" />
            </div>

            <div className="flex justify-between items-center pt-1">
              <Button variant="ghost" size="sm" onClick={clearCanvas} className="text-xs text-rose-500 font-bold hover:bg-rose-500/10">
                <Eraser className="w-3.5 h-3.5 mr-1" /> Clear Canvas
              </Button>
            </div>
          </div>
        )}

        {/* --- TAB 2: TYPE NAME --- */}
        {activeTab === 'type' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase text-muted-foreground">Full Legal Name</label>
              <Input
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Type your full legal name"
                className="font-bold text-sm"
              />
            </div>

            <div className="border border-border/60 rounded-2xl p-6 bg-white dark:bg-slate-950 text-center min-h-[140px] flex items-center justify-center shadow-inner">
              <p
                className="text-4xl text-blue-800 dark:text-blue-400 tracking-wide font-serif italic"
                style={{ fontFamily: '"Brush Script MT", "Dancing Script", cursive, Georgia, serif' }}
              >
                {typedName || 'Your Signature'}
              </p>
            </div>
          </div>
        )}

        {/* --- TAB 3: UPLOAD IMAGE --- */}
        {activeTab === 'upload' && (
          <div className="space-y-3">
            <div className="border-2 border-dashed border-border/70 rounded-2xl p-6 text-center bg-card hover:bg-secondary/20 transition cursor-pointer">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="sig-image-upload" />
              <label htmlFor="sig-image-upload" className="cursor-pointer block space-y-2">
                <Upload className="w-8 h-8 mx-auto text-primary opacity-70" />
                <p className="text-xs font-bold text-foreground">Click to upload signature image</p>
                <p className="text-[10px] text-muted-foreground">PNG, JPG, or SVG transparent image</p>
              </label>
            </div>
            {uploadedImage && (
              <div className="p-3 border rounded-xl bg-white dark:bg-slate-950 text-center">
                <img src={uploadedImage} alt="Uploaded Signature" className="max-h-24 mx-auto object-contain" />
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAdoptAndSave}
            disabled={activeTab === 'draw' ? !hasDrawn : activeTab === 'type' ? !typedName : !uploadedImage}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6"
          >
            <Check className="w-4 h-4 mr-2" /> Adopt & Save Signature
          </Button>
        </div>
      </div>
    </FormDialog>
  );
};
