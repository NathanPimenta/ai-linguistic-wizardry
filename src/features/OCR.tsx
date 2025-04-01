
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, FileImage, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import LoadingIndicator from "@/components/LoadingIndicator";
import AzureService from "@/services/AzureService";
import { useApi } from "@/contexts/ApiContext";

const OCR = () => {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState("");
  const { toast } = useToast();
  const { isLoading, setIsLoading } = useApi();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOCR = async () => {
    if (!image) {
      toast({
        title: "Image required",
        description: "Please upload an image to extract text.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await AzureService.ocrFromImage(image);
      setOcrText(result.text);
    } catch (error) {
      console.error("OCR error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(ocrText);
    toast({
      title: "Copied to clipboard",
      description: "The extracted text has been copied to your clipboard.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileImage className="mr-2 h-5 w-5 text-azure-500" />
            Image Upload
          </CardTitle>
          <CardDescription>
            Upload an image with handwritten or printed text
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4">
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            {imagePreview ? (
              <div className="relative w-full">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="max-h-[300px] mx-auto object-contain rounded-md" 
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 mx-auto block"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  Change Image
                </Button>
              </div>
            ) : (
              <label 
                htmlFor="image-upload" 
                className="flex flex-col items-center justify-center cursor-pointer h-[200px]"
              >
                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-400">PNG, JPG, JPEG, GIF up to 10MB</p>
              </label>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleOCR} 
            className="bg-azure-500 hover:bg-azure-600" 
            disabled={isLoading || !image}
          >
            Extract Text
          </Button>
        </CardFooter>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileImage className="mr-2 h-5 w-5 text-azure-500" />
            Extracted Text
          </CardTitle>
          <CardDescription>
            Text extracted from your image
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingIndicator message="Extracting text from image..." />
          ) : (
            <Textarea
              value={ocrText}
              onChange={(e) => setOcrText(e.target.value)}
              placeholder="Extracted text will appear here"
              className="min-h-[300px]"
              readOnly={!ocrText}
            />
          )}
        </CardContent>
        {ocrText && (
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={handleCopy} 
              className="flex items-center space-x-2"
            >
              <Copy className="h-4 w-4" />
              <span>Copy to Clipboard</span>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default OCR;
