
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Languages } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import LoadingIndicator from "@/components/LoadingIndicator";
import AzureService from "@/services/AzureService";
import { useApi } from "@/contexts/ApiContext";

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "nl", name: "Dutch" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh-Hans", name: "Chinese (Simplified)" },
  { code: "zh-Hant", name: "Chinese (Traditional)" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "ru", name: "Russian" },
];

const Translator = () => {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [detectedLanguage, setDetectedLanguage] = useState("");
  const { toast } = useToast();
  const { isLoading, setIsLoading } = useApi();

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Input required",
        description: "Please enter some text to translate.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await AzureService.translateText(inputText, targetLanguage);
      setTranslatedText(result.translatedText);
      if (result.detectedLanguage) {
        setDetectedLanguage(result.detectedLanguage);
      }
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    toast({
      title: "Copied to clipboard",
      description: "The translated text has been copied to your clipboard.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Languages className="mr-2 h-5 w-5 text-azure-500" />
            Input Text
          </CardTitle>
          <CardDescription>
            Enter the text you want to translate
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
        <CardFooter className="flex flex-col items-start space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
          <div className="w-full sm:w-auto">
            <Select 
              value={targetLanguage}
              onValueChange={setTargetLanguage}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((language) => (
                  <SelectItem key={language.code} value={language.code}>
                    {language.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleTranslate} 
            className="w-full sm:w-auto bg-azure-500 hover:bg-azure-600" 
            disabled={isLoading || !inputText.trim()}
          >
            Translate Text
          </Button>
        </CardFooter>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Languages className="mr-2 h-5 w-5 text-azure-500" />
            Translated Result
          </CardTitle>
          <CardDescription>
            {detectedLanguage ? `Detected language: ${detectedLanguage}` : "The translated version of your text"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingIndicator message="Translating your text..." />
          ) : translatedText ? (
            <div className="bg-muted p-4 rounded-md min-h-[200px]">
              <p className="whitespace-pre-wrap">{translatedText}</p>
            </div>
          ) : (
            <div className="bg-muted p-4 rounded-md min-h-[200px] flex items-center justify-center text-muted-foreground">
              Your translated text will appear here
            </div>
          )}
        </CardContent>
        {translatedText && (
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

export default Translator;
