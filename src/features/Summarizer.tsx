
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import LoadingIndicator from "@/components/LoadingIndicator";
import AzureService from "@/services/AzureService";
import { useApi } from "@/contexts/ApiContext";

const Summarizer = () => {
  const [inputText, setInputText] = useState("");
  const [summarizedText, setSummarizedText] = useState("");
  const { toast } = useToast();
  const { isLoading, setIsLoading } = useApi();

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Input required",
        description: "Please enter some text to summarize.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await AzureService.summarizeText(inputText);
      setSummarizedText(result.summarizedText);
    } catch (error) {
      console.error("Summarization error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summarizedText);
    toast({
      title: "Copied to clipboard",
      description: "The summarized text has been copied to your clipboard.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5 text-azure-500" />
            Input Text
          </CardTitle>
          <CardDescription>
            Enter the text you want to summarize
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Enter your text here... (minimum 100 characters for best results)"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-[200px]"
          />
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSummarize} 
            className="bg-azure-500 hover:bg-azure-600" 
            disabled={isLoading || !inputText.trim()}
          >
            Summarize Text
          </Button>
        </CardFooter>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5 text-azure-500" />
            Summarized Result
          </CardTitle>
          <CardDescription>
            The AI-generated summary of your text
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingIndicator message="Summarizing your text..." />
          ) : summarizedText ? (
            <div className="bg-muted p-4 rounded-md min-h-[200px]">
              <p className="whitespace-pre-wrap">{summarizedText}</p>
            </div>
          ) : (
            <div className="bg-muted p-4 rounded-md min-h-[200px] flex items-center justify-center text-muted-foreground">
              Your summarized text will appear here
            </div>
          )}
        </CardContent>
        {summarizedText && (
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

export default Summarizer;
