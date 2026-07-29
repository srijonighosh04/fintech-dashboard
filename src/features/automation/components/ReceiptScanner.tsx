'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { scanReceiptAction } from '../actions/ocrActions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/utils/format';

interface ScannedTransaction {
  name: string;
  amount: number;
  category: string;
  date: string | Date;
}

interface ReceiptScannerProps {
  userId: string;
}

export function ReceiptScanner({ userId }: ReceiptScannerProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successData, setSuccessData] = useState<ScannedTransaction | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
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

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, JPEG).');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccessData(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      const response = await scanReceiptAction(userId, base64Data, file.name);

      setIsProcessing(false);
      if (response.success) {
        setSuccessData(response.data as ScannedTransaction);
      } else {
        setError(response.error || 'Failed to scan receipt.');
      }
    };
    reader.onerror = () => {
      setError('Failed to read file.');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="border border-border/60 bg-card/60 backdrop-blur-md shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold tracking-tight">Receipt Scanner</CardTitle>
        <CardDescription>Upload purchase receipts to automatically extract text and log transactions.</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Upload Container Area */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 ${
            dragActive
              ? 'border-cyan-500 bg-cyan-500/5'
              : 'border-border/60 hover:border-border bg-muted/10'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleChange}
            disabled={isProcessing}
          />

          {isProcessing ? (
            <div className="space-y-4 animate-pulse">
              <div className="relative flex items-center justify-center">
                <Loader2 className="h-10 w-10 text-cyan-500 animate-spin" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Analyzing Receipt</p>
                <p className="text-xs text-muted-foreground">Running Gemini OCR layout algorithms...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-foreground">Drag and drop receipt image here</p>
                <p className="text-[10px] text-muted-foreground">Supports PNG, JPG, JPEG up to 5MB</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onButtonClick}
                className="shadow-sm"
              >
                Browse Image
              </Button>
            </div>
          )}
        </div>

        {/* Status Alerts boxes */}
        {error && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs text-rose-500 font-semibold flex items-start gap-2 animate-in fade-in duration-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successData && (
          <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 space-y-3 animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-2 text-xs text-emerald-500 font-bold border-b border-emerald-500/10 pb-2">
              <CheckCircle className="h-4.5 w-4.5" />
              <span>Receipt Parsed successfully!</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Merchant</span>
                <p className="font-extrabold text-foreground">{successData.name}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Amount Paid</span>
                <p className="font-extrabold text-foreground">{formatCurrency(successData.amount)}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Category</span>
                <span className="inline-flex rounded bg-muted/40 border border-border/20 px-1.5 py-0.2 font-semibold text-muted-foreground">
                  {successData.category}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Transaction Date</span>
                <p className="font-semibold text-foreground">
                  {new Date(successData.date).toISOString().split('T')[0]}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
