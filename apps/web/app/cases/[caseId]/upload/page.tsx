"use client";
import * as React from "react";
import { useUploadDocument } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Loader2, Upload, CheckCircle, FileText, ArrowLeft } from "lucide-react";

export default function UploadPage({ params }: { params: { caseId: string } }) {
  const router = useRouter();
  const [file, setFile] = React.useState<File | null>(null);
  const uploadMutation = useUploadDocument(params.caseId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.type !== "application/pdf") {
        alert("Only PDF files are allowed");
        return;
      }
      if (selected.size > 10 * 1024 * 1024) {
        alert("File size exceeds limit (10MB max)");
        return;
      }
      setFile(selected);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("No file uploaded");
      return;
    }
    uploadMutation.mutate(file, {
      onSuccess: () => {
        setTimeout(() => {
          router.push(`/cases/${params.caseId}`);
        }, 1500);
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Button
        variant="ghost"
        onClick={() => router.push(`/cases/${params.caseId}`)}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Case
      </Button>

      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <Upload className="w-6 h-6 text-indigo-600" />
          <h1 className="text-2xl font-semibold text-gray-900">Upload PDF Evidence</h1>
        </div>

        {uploadMutation.isSuccess ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Successful!</h3>
            <p className="text-sm text-gray-600 mb-4">Your document has been uploaded and processed.</p>
            <p className="text-xs text-gray-500">Redirecting back to case...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {uploadMutation.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium">
                  {(uploadMutation.error as any)?.response?.data?.error || "Upload failed"}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Label htmlFor="file" className="text-base">Select PDF Document</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition">
                <input
                  id="file"
                  name="file"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
                <label htmlFor="file" className="cursor-pointer">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  {file ? (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                      <p className="text-xs text-indigo-600 mt-2">Click to change file</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-1">Click to select PDF</p>
                      <p className="text-xs text-gray-500">Maximum file size: 10MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/cases/${params.caseId}`)}
                disabled={uploadMutation.isPending}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!file || uploadMutation.isPending}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
