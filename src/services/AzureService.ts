
import { toast } from "@/components/ui/use-toast";

// Define endpoints for Azure API services
// const API_BASE_URL = 'https://ai-linguistic-wizardry.lovable.app/api'; // This will connect to our Express backend

const API_BASE_URL = 'http://localhost:3000/api'; // This will connect to our Express backend
// API response type definitions
export interface TranslationResponse {
  translatedText: string;
  detectedLanguage?: string;
}

export interface SummarizationResponse {
  summarizedText: string;
}

export interface OCRResponse {
  text: string;
}

export interface HandwrittenResponse {
  imageUrl: string;
}

export interface TextToSpeechResponse {
  audioUrl: string;
}

export interface SpeechToTextResponse {
  text: string;
}

// Azure services class with methods for each feature
class AzureService {
  // Text summarization service
  async summarizeText(text: string): Promise<SummarizationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to summarize text');
      }

      return await response.json();
    } catch (error) {
      toast({
        title: "Summarization failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Text translation service
  async translateText(text: string, targetLanguage: string): Promise<TranslationResponse> {
    try {
      console.log('Translation request parameters:', { text, targetLanguage });
      
      const response = await fetch(`${API_BASE_URL}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, targetLanguage }),
      });

      console.log('Translation API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Translation API error:', errorData);
        throw new Error(errorData.message || `Failed to translate text: ${response.status}`);
      }

      const result = await response.json();
      console.log('Translation API result:', result);
      return result;
    } catch (error) {
      console.error('Translation service error:', error);
      toast({
        title: "Translation failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    }
  }

  // OCR (Handwritten to text) service
  async ocrFromImage(imageFile: File): Promise<OCRResponse> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`${API_BASE_URL}/ocr`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to process image');
      }

      return await response.json();
    } catch (error) {
      toast({
        title: "OCR processing failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Text to Handwritten service
  async textToHandwritten(text: string): Promise<HandwrittenResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/text-to-handwritten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to convert text to handwritten');
      }

      return await response.json();
    } catch (error) {
      toast({
        title: "Text to handwritten conversion failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Text to Speech service
  async textToSpeech(text: string, voice: string = 'en-US-JennyNeural'): Promise<TextToSpeechResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/text-to-speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, voice }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to convert text to speech');
      }

      return await response.json();
    } catch (error) {
      toast({
        title: "Text to speech conversion failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    }
  }

  // Speech to Text service
  async speechToText(audioFile: File): Promise<SpeechToTextResponse> {
    try {
      const formData = new FormData();
      formData.append('audio', audioFile);

      const response = await fetch(`${API_BASE_URL}/speech-to-text`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to convert speech to text');
      }

      return await response.json();
    } catch (error) {
      toast({
        title: "Speech to text conversion failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    }
  }
}

export default new AzureService();
