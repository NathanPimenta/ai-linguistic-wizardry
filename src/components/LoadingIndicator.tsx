
import { Loader2 } from "lucide-react";

interface LoadingIndicatorProps {
  message?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  message = "Processing your request..." 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 animate-pulse-azure rounded-lg">
      <Loader2 className="h-8 w-8 text-azure-500 animate-spin" />
      <p className="mt-4 text-lg text-azure-700 dark:text-azure-300 font-medium">{message}</p>
    </div>
  );
};

export default LoadingIndicator;
