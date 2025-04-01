
import { useState } from "react";
import Header, { FeatureType } from "@/components/Header";
import { ApiProvider } from "@/contexts/ApiContext";

// Import feature components
import Summarizer from "@/features/Summarizer";
import Translator from "@/features/Translator";
import OCR from "@/features/OCR";
import TextToHandwritten from "@/features/TextToHandwritten";
import TextToSpeech from "@/features/TextToSpeech";
import SpeechToText from "@/features/SpeechToText";

const Index = () => {
  const [activeFeature, setActiveFeature] = useState<FeatureType>("summarizer");

  // Render the active feature component
  const renderFeature = () => {
    switch (activeFeature) {
      case "summarizer":
        return <Summarizer />;
      case "translator":
        return <Translator />;
      case "ocr":
        return <OCR />;
      case "handwritten":
        return <TextToHandwritten />;
      case "text-to-speech":
        return <TextToSpeech />;
      case "speech-to-text":
        return <SpeechToText />;
      default:
        return <Summarizer />;
    }
  };

  return (
    <ApiProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header activeFeature={activeFeature} setActiveFeature={setActiveFeature} />
        <main className="pb-12">
          {renderFeature()}
        </main>
      </div>
    </ApiProvider>
  );
};

export default Index;
