
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Mic, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import LoadingIndicator from "@/components/LoadingIndicator";
import AzureService from "@/services/AzureService";
import { useApi } from "@/contexts/ApiContext";

const SpeechToText = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioName, setAudioName] = useState("");
  const [transcribedText, setTranscribedText] = useState("");
  const { toast } = useToast();
  const { isLoading, setIsLoading } = useApi();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile(file);
      setAudioName(file.name);
    }
  };

  const handleTranscribe = async () => {
    if (!audioFile) {
      toast({
        title: "Audio required",
        description: "Please upload an audio file to transcribe.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await AzureService.speechToText(audioFile);
      setTranscribedText(result.text);
    } catch (error) {
      console.error("Speech to text error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcribedText);
    toast({
      title: "Copied to clipboard",
      description: "The transcribed text has been copied to your clipboard.",
    });
  };

  return (
    <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mic className="mr-2 h-5 w-5 text-azure-500" />
            Audio Upload
          </CardTitle>
          <CardDescription>
            Upload an audio file to transcribe to text
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4">
            <input
              type="file"
              ref={fileInputRef}
              id="audio-upload"
              accept="audio/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <label 
              htmlFor="audio-upload" 
              className="flex flex-col items-center justify-center cursor-pointer h-[200px] w-full"
            >
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Click to upload audio file</p>
              <p className="text-xs text-gray-400">MP3, WAV, M4A up to 10MB</p>
              {audioName && (
                <div className="mt-4 p-2 bg-azure-50 rounded-md">
                  <p className="text-sm text-azure-700 font-medium">{audioName}</p>
                </div>
              )}
            </label>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleTranscribe} 
            className="bg-azure-500 hover:bg-azure-600" 
            disabled={isLoading || !audioFile}
          >
            Transcribe Audio
          </Button>
        </CardFooter>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mic className="mr-2 h-5 w-5 text-azure-500" />
            Transcribed Text
          </CardTitle>
          <CardDescription>
            Text transcribed from your audio
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingIndicator message="Transcribing your audio..." />
          ) : (
            <Textarea
              value={transcribedText}
              onChange={(e) => setTranscribedText(e.target.value)}
              placeholder="Transcribed text will appear here"
              className="min-h-[300px]"
              readOnly={!transcribedText}
            />
          )}
        </CardContent>
        {transcribedText && (
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

export default SpeechToText;
