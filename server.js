
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Azure SDK imports
const { TextAnalyticsClient, AzureKeyCredential } = require('@azure/ai-text-analytics');
const { ComputerVisionClient } = require('@azure/cognitiveservices-computervision');
const { CognitiveServicesCredentials } = require('@azure/ms-rest-azure-js');
const { SpeechConfig, AudioConfig, SpeechSynthesizer, SpeechRecognizer } = require('microsoft-cognitiveservices-speech-sdk');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS to allow requests from your frontend
app.use(cors({
  origin: 'http://localhost:8080'
}));

// Middleware for parsing JSON
app.use(express.json());

// Set up multer storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create Azure clients
const textAnalyticsClient = new TextAnalyticsClient(
  process.env.AZURE_LANGUAGE_ENDPOINT || '',
  new AzureKeyCredential(process.env.AZURE_LANGUAGE_KEY || '')
);

const computerVisionClient = new ComputerVisionClient(
  new CognitiveServicesCredentials(process.env.AZURE_VISION_KEY || ''),
  process.env.AZURE_VISION_ENDPOINT || ''
);

// API routes

// Text Summarization endpoint
app.post('/api/summarize', async (req, res) => {
  try {
    const { text } = req.body;
    
    // Validate input
    if (!text || text.length < 10) {
      return res.status(400).json({ message: 'Text is too short for summarization' });
    }

    // Use Azure Language Studio for extractive summarization
    const documents = [{ text, id: '1', language: 'en' }];
    const actions = {
      extractiveSummarizationActions: [{ 
        parameters: { 
          sentenceCount: 3,
          sortBy: 'Offset'
        } 
      }]
    };

    const results = await textAnalyticsClient.beginAnalyzeBatch(documents, actions);
    const resultData = await results.pollUntilDone();
    
    const summary = resultData.extractiveSummarizeResults[0].documents[0].sentences
      .map(sentence => sentence.text)
      .join(' ');

    return res.json({ summarizedText: summary });
  } catch (error) {
    console.error('Error in summarize API:', error);
    return res.status(500).json({ message: 'Failed to summarize text', error: error.message });
  }
});

// Text Translation endpoint
app.post('/api/translate', async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    
    // Validate input
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }
    
    if (!targetLanguage) {
      return res.status(400).json({ message: 'Target language is required' });
    }

    // Use Azure Translator service
    const subscriptionKey = process.env.AZURE_TRANSLATOR_KEY;
    const endpoint = process.env.AZURE_TRANSLATOR_ENDPOINT || 'https://api.cognitive.microsofttranslator.com';

    const response = await fetch(`${endpoint}/translate?api-version=3.0&to=${targetLanguage}`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'Ocp-Apim-Subscription-Region': process.env.AZURE_TRANSLATOR_REGION || 'global',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{ text }])
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Translation failed');
    }

    const translatedText = data[0].translations[0].text;
    const detectedLanguage = data[0].detectedLanguage?.language;

    return res.json({ 
      translatedText, 
      detectedLanguage 
    });
  } catch (error) {
    console.error('Error in translate API:', error);
    return res.status(500).json({ message: 'Failed to translate text', error: error.message });
  }
});

// OCR (Handwritten to text) endpoint
app.post('/api/ocr', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const imagePath = req.file.path;
    
    // Read the image file
    const imageBuffer = fs.readFileSync(imagePath);
    
    // Use Azure Computer Vision for OCR
    const result = await computerVisionClient.readInStream(imageBuffer);
    
    // Get operation ID from response for polling
    const operationId = result.operationLocation.split('/').pop();
    
    // Wait for the OCR processing to complete
    let status = 'notStarted';
    let recognitionResult;
    
    while (status !== 'succeeded') {
      recognitionResult = await computerVisionClient.getReadResult(operationId);
      status = recognitionResult.status;
      
      // If still running, wait a second
      if (status === 'running') {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Extract text from OCR result
    const textResult = recognitionResult.analyzeResult.readResults
      .map(page => page.lines.map(line => line.text).join(' '))
      .join('\n');
    
    // Remove the temporary file
    fs.unlinkSync(imagePath);
    
    return res.json({ text: textResult });
  } catch (error) {
    console.error('Error in OCR API:', error);
    return res.status(500).json({ message: 'Failed to process image', error: error.message });
  }
});

// Text to Handwritten endpoint
app.post('/api/text-to-handwritten', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }
    
    // For this demo, we'll use a public handwriting API (Mock implementation)
    // In production, use a real handwriting service or Azure Cognitive Services
    
    // This is a mock implementation - in a real app, you would use a proper service
    // Generate a random identifier for the file
    const fileId = Date.now().toString();
    const outputPath = path.join(__dirname, 'uploads', `handwritten-${fileId}.png`);
    
    // Simulate API processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Return the mock URL to the generated image
    // In a real implementation, generate an actual handwritten image
    const imageUrl = `http://localhost:${PORT}/uploads/handwritten-${fileId}.png`;
    
    return res.json({ imageUrl });
  } catch (error) {
    console.error('Error in text-to-handwritten API:', error);
    return res.status(500).json({ message: 'Failed to convert text to handwritten', error: error.message });
  }
});

// Text to Speech endpoint
app.post('/api/text-to-speech', async (req, res) => {
  try {
    const { text, voice } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }
    
    // Generate a unique ID for the audio file
    const fileId = Date.now().toString();
    const outputPath = path.join(__dirname, 'uploads', `speech-${fileId}.mp3`);
    
    // Create the speech configuration with Azure credentials
    const speechConfig = SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION
    );
    
    // Set speech synthesis output format
    speechConfig.speechSynthesisOutputFormat = 5; // mp3
    speechConfig.speechSynthesisVoiceName = voice || 'en-US-JennyNeural';
    
    // Create audio output configuration
    const audioConfig = AudioConfig.fromAudioFileOutput(outputPath);
    
    // Create the speech synthesizer
    const synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);
    
    // Synthesize text to speech
    return new Promise((resolve, reject) => {
      synthesizer.speakTextAsync(
        text,
        result => {
          synthesizer.close();
          
          if (result) {
            const audioUrl = `http://localhost:${PORT}/uploads/speech-${fileId}.mp3`;
            resolve(res.json({ audioUrl }));
          } else {
            reject(new Error('Speech synthesis failed'));
          }
        },
        error => {
          synthesizer.close();
          reject(error);
        }
      );
    });
  } catch (error) {
    console.error('Error in text-to-speech API:', error);
    return res.status(500).json({ message: 'Failed to convert text to speech', error: error.message });
  }
});

// Speech to Text endpoint
app.post('/api/speech-to-text', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No audio file uploaded' });
    }
    
    const audioPath = req.file.path;
    
    // Create the speech configuration with Azure credentials
    const speechConfig = SpeechConfig.fromSubscription(
      process.env.AZURE_SPEECH_KEY,
      process.env.AZURE_SPEECH_REGION
    );
    
    // Create audio configuration from the audio file
    const audioConfig = AudioConfig.fromWavFileInput(audioPath);
    
    // Create the speech recognizer
    const recognizer = new SpeechRecognizer(speechConfig, audioConfig);
    
    // Start speech recognition
    return new Promise((resolve, reject) => {
      let recognizedText = '';
      
      recognizer.recognizing = (s, e) => {
        console.log(`Recognizing: ${e.result.text}`);
      };
      
      recognizer.recognized = (s, e) => {
        if (e.result.reason === ResultReason.RecognizedSpeech) {
          recognizedText += e.result.text + ' ';
        }
      };
      
      recognizer.canceled = (s, e) => {
        console.log(`CANCELED: Reason=${e.reason}`);
        recognizer.stopContinuousRecognitionAsync();
        reject(new Error('Speech recognition canceled'));
      };
      
      recognizer.sessionStopped = (s, e) => {
        console.log("Session stopped");
        recognizer.stopContinuousRecognitionAsync();
      };
      
      recognizer.startContinuousRecognitionAsync(
        () => {
          // Recognition started successfully
          setTimeout(() => {
            recognizer.stopContinuousRecognitionAsync(
              () => {
                // Clean up the audio file
                fs.unlinkSync(audioPath);
                
                // Return the recognized text
                resolve(res.json({ text: recognizedText.trim() }));
              },
              error => reject(error)
            );
          }, 5000); // Allow 5 seconds of audio processing
        },
        error => reject(error)
      );
    });
  } catch (error) {
    console.error('Error in speech-to-text API:', error);
    return res.status(500).json({ message: 'Failed to convert speech to text', error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('API endpoints:');
  console.log(`- Text Summarizer: http://localhost:${PORT}/api/summarize`);
  console.log(`- Language Translator: http://localhost:${PORT}/api/translate`);
  console.log(`- OCR: http://localhost:${PORT}/api/ocr`);
  console.log(`- Text to Handwritten: http://localhost:${PORT}/api/text-to-handwritten`);
  console.log(`- Text to Speech: http://localhost:${PORT}/api/text-to-speech`);
  console.log(`- Speech to Text: http://localhost:${PORT}/api/speech-to-text`);
});
