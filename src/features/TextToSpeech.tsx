
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Play, Pause, Volume2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import LoadingIndicator from "@/components/LoadingIndicator";
import AzureService from "@/services/AzureService";
import { useApi } from "@/contexts/ApiContext";

const voices = [
  { code: "en-US-JennyNeural", name: "Jenny (Female, US)" },
  { code: "en-US-GuyNeural", name: "Guy (Male, US)" },
  { code: "en-GB-SoniaNeural", name: "Sonia (Female, UK)" },
  { code: "en-AU-WilliamNeural", name: "William (Male, AU)" },
  { code: "es-ES-ElviraNeural", name: "Elvira (Female, ES)" },
  { code: "fr-FR-DeniseNeural", name: "Denise (Female, FR)" },
  { code: "de-DE-KatjaNeural", name: "Katja (Female, DE)" },
  { code: "it-IT-ElsaNeural", name: "Elsa (Female, IT)" },
  { code: "ja-JP-NanamiNeural", name: "Nanami (Female, JP)" },
];

const TextToSpeech = () => {
  const [inputText, setInputText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState("en-US-JennyNeural");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const { isLoading, setIsLoading } = useApi();

  const handleConvert = async () => {
    if (!inputText.trim()) {
      toast({
        title: "Input required",
        description: "Please enter some text to convert to speech.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const result = await AzureService.textToSpeech(inputText, selectedVoice);
      setAudioUrl(result.audioUrl);

      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Text to speech error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.error("Error playing audio:", error);
          toast({
            title: "Playback error",
            description: "There was an error playing the audio.",
            variant: "destructive",
          });
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = 'speech.mp3';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download started",
        description: "Your audio file is being downloaded.",
      });
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Volume2 className="mr-2 h-5 w-5 text-azure-500" />
            Input Text
          </CardTitle>
          <CardDescription>
            Enter the text you want to convert to speech
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
              value={selectedVoice}
              onValueChange={setSelectedVoice}
            >
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Select voice" />
              </SelectTrigger>
              <SelectContent>
                {voices.map((voice) => (
                  <SelectItem key={voice.code} value={voice.code}>
                    {voice.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleConvert} 
            className="w-full sm:w-auto bg-azure-500 hover:bg-azure-600" 
            disabled={isLoading || !inputText.trim()}
          >
            Generate Speech
          </Button>
        </CardFooter>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Volume2 className="mr-2 h-5 w-5 text-azure-500" />
            Speech Output
          </CardTitle>
          <CardDescription>
            Listen to the generated speech
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingIndicator message="Generating speech..." />
          ) : audioUrl ? (
            <div className="flex flex-col items-center">
              <audio 
                ref={audioRef} 
                src={audioUrl} 
                onEnded={handleAudioEnded} 
                className="hidden"
              />
              <div className="w-full bg-muted p-8 rounded-md flex justify-center items-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-16 w-16 rounded-full border-2 border-azure-500"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? (
                    <Pause className="h-8 w-8 text-azure-500" />
                  ) : (
                    <Play className="h-8 w-8 text-azure-500 ml-1" />
                  )}
                </Button>
              </div>
              <div className="text-sm text-muted-foreground mt-4">
                Click the button to play/pause the audio
              </div>
            </div>
          ) : (
            <div className="bg-muted p-4 rounded-md min-h-[200px] flex items-center justify-center text-muted-foreground">
              Generated speech will be available here
            </div>
          )}
        </CardContent>
        {audioUrl && (
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={handleDownload} 
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download Audio</span>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default TextToSpeech;
