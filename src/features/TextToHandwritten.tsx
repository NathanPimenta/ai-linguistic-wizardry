
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, PenTool } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import LoadingIndicator from "@/components/LoadingIndicator";
import AzureService from "@/services/AzureService";
import { useApi } from "@/contexts/ApiContext";

const TextToHandwritten = () => {
  const [inputText, setInputText] = useState("");
  const [handwrittenImageUrl, setHandwrittenImageUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const { isLoading, setIsLoading } = useApi();

  const handleConvert = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Input required",
        description: "Please enter some text to convert.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await AzureService.textToHandwritten(inputText);
      setHandwrittenImageUrl(result.imageUrl);
    } catch (error) {
      console.error("Text to handwritten error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (handwrittenImageUrl) {
      const link = document.createElement('a');
      link.href = handwrittenImageUrl;
      link.download = 'handwritten-text.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download started",
        description: "Your handwritten image is being downloaded.",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <PenTool className="mr-2 h-5 w-5 text-azure-500" />
            Input Text
          </CardTitle>
          <CardDescription>
            Enter the text you want to convert to handwriting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter your text here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-[200px]"
          />
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleConvert} 
            className="bg-azure-500 hover:bg-azure-600" 
            disabled={isLoading || !inputText.trim()}
          >
            Convert to Handwriting
          </Button>
        </CardFooter>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <PenTool className="mr-2 h-5 w-5 text-azure-500" />
            Handwritten Result
          </CardTitle>
          <CardDescription>
            Your text converted to handwriting
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingIndicator message="Converting to handwriting..." />
          ) : handwrittenImageUrl ? (
            <div className="flex justify-center">
              <img
                src={handwrittenImageUrl}
                alt="Handwritten text"
                className="max-w-full border rounded-md shadow-sm"
              />
            </div>
          ) : (
            <div className="bg-muted p-4 rounded-md min-h-[200px] flex items-center justify-center text-muted-foreground">
              Your handwritten text will appear here
            </div>
          )}
        </CardContent>
        {handwrittenImageUrl && (
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={handleDownload} 
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download Image</span>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default TextToHandwritten;
