import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TWIN_NAMES = [
  "Albert Einstein",
  "Elon Musk",
  "Emad Mostaque",
  "Fei-Fei Li",
  "Leonardo da Vinci",
  "Steve Jobs",
  "Walt Disney"
];

interface UploadStatus {
  [key: string]: {
    status: 'idle' | 'uploading' | 'success' | 'error';
    message?: string;
  };
}

export default function DocumentUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({});
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, twinName: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.docx')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a Word document (.docx)",
        variant: "destructive",
      });
      return;
    }

    setUploadStatus(prev => ({
      ...prev,
      [twinName]: { status: 'uploading' }
    }));
    setUploading(true);

    const formData = new FormData();
    formData.append('document', file);
    formData.append('name', twinName);

    try {
      console.log('Attempting to upload document for:', twinName);
      const response = await fetch('/api/upload-twin-document', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed with status:', response.status);
        console.error('Error response:', errorText);
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Upload successful:', result);

      setUploadStatus(prev => ({
        ...prev,
        [twinName]: { 
          status: 'success',
          message: result.message
        }
      }));

      toast({
        title: "Upload Successful",
        description: `Document for ${twinName} has been processed successfully.`,
      });
    } catch (error) {
      console.error('Upload error details:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      setUploadStatus(prev => ({
        ...prev,
        [twinName]: { 
          status: 'error',
          message: error instanceof Error ? error.message : 'Failed to upload document'
        }
      }));

      toast({
        title: "Upload Failed",
        description: "Failed to upload and process the document. Please check console for details.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-2">
        <Upload className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Upload Digital Twin Documents</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {TWIN_NAMES.map((name) => (
          <div key={name} className="flex items-center justify-between p-2 border rounded-lg hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-2">
              <span className="font-medium">{name}</span>
              {uploadStatus[name] && getStatusIcon(uploadStatus[name].status)}
              {uploadStatus[name]?.message && (
                <span className={`text-sm ${uploadStatus[name].status === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                  {uploadStatus[name].message}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".docx"
                onChange={(e) => handleFileUpload(e, name)}
                className="hidden"
                id={`file-${name}`}
                disabled={uploading}
              />
              <label htmlFor={`file-${name}`}>
                <Button
                  variant={uploadStatus[name]?.status === 'success' ? "secondary" : "outline"}
                  disabled={uploading}
                  className="cursor-pointer"
                  asChild
                >
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadStatus[name]?.status === 'success' ? 'Update Document' : 'Upload Document'}
                  </span>
                </Button>
              </label>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}