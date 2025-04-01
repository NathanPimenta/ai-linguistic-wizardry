
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Languages, 
  FileHandwritten, 
  PenTool, 
  Volume2, 
  Mic, 
  Menu, 
  X 
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export type FeatureType = 
  | "summarizer" 
  | "translator" 
  | "ocr" 
  | "handwritten" 
  | "text-to-speech" 
  | "speech-to-text";

interface HeaderProps {
  activeFeature: FeatureType;
  setActiveFeature: (feature: FeatureType) => void;
}

interface FeatureOption {
  id: FeatureType;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const Header: React.FC<HeaderProps> = ({ activeFeature, setActiveFeature }) => {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features: FeatureOption[] = [
    {
      id: "summarizer",
      name: "Text Summarizer",
      icon: <FileText className="h-5 w-5" />,
      description: "Condense long text into concise summaries"
    },
    {
      id: "translator",
      name: "Language Translator",
      icon: <Languages className="h-5 w-5" />,
      description: "Translate text between multiple languages"
    },
    {
      id: "ocr",
      name: "OCR",
      icon: <FileHandwritten className="h-5 w-5" />,
      description: "Convert handwritten images to text"
    },
    {
      id: "handwritten",
      name: "Text to Handwritten",
      icon: <PenTool className="h-5 w-5" />,
      description: "Convert typed text to handwritten style"
    },
    {
      id: "text-to-speech",
      name: "Text to Speech",
      icon: <Volume2 className="h-5 w-5" />,
      description: "Convert text to natural-sounding speech"
    },
    {
      id: "speech-to-text",
      name: "Speech to Text",
      icon: <Mic className="h-5 w-5" />,
      description: "Transcribe audio recordings to text"
    }
  ];

  const toggleFeature = (feature: FeatureType) => {
    setActiveFeature(feature);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="w-full bg-white dark:bg-gray-900 border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold gradient-text">
              Azure AI Linguistic Wizardry
            </h1>
          </div>
          
          {isMobile ? (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          ) : null}
        </div>
        
        {/* Desktop Navigation */}
        {!isMobile && (
          <nav className="mt-4">
            <ul className="flex overflow-x-auto space-x-2 pb-2">
              {features.map((feature) => (
                <li key={feature.id}>
                  <Button
                    variant={activeFeature === feature.id ? "default" : "outline"}
                    className={`whitespace-nowrap ${
                      activeFeature === feature.id ? "bg-azure-500 hover:bg-azure-600" : ""
                    }`}
                    onClick={() => toggleFeature(feature.id)}
                  >
                    {feature.icon}
                    <span className="ml-2">{feature.name}</span>
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
        )}
        
        {/* Mobile Navigation */}
        {isMobile && mobileMenuOpen && (
          <nav className="mt-4">
            <ul className="flex flex-col space-y-2">
              {features.map((feature) => (
                <li key={feature.id}>
                  <Button
                    variant={activeFeature === feature.id ? "default" : "outline"}
                    className={`w-full justify-start ${
                      activeFeature === feature.id ? "bg-azure-500 hover:bg-azure-600" : ""
                    }`}
                    onClick={() => toggleFeature(feature.id)}
                  >
                    {feature.icon}
                    <span className="ml-2">{feature.name}</span>
                  </Button>
                  <p className="text-sm text-muted-foreground mt-1 ml-2">
                    {feature.description}
                  </p>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
