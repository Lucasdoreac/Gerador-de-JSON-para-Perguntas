
import React, { useState, useEffect } from 'react';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';

interface JsonDisplayProps {
  jsonString: string;
  placeholder: string;
}

export const JsonDisplay: React.FC<JsonDisplayProps> = ({ jsonString, placeholder }) => {
  const [isCopied, setIsCopied] = useState(false);
  const textToDisplay = jsonString || placeholder;
  const isPlaceholder = !jsonString;

  const handleCopy = async () => {
    if (isPlaceholder) return;
    try {
      await navigator.clipboard.writeText(jsonString);
      setIsCopied(true);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  return (
    <div className="relative bg-slate-900 rounded-lg h-full">
      <button
        onClick={handleCopy}
        disabled={isPlaceholder}
        className="absolute top-2 right-2 p-2 rounded-md bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-slate-300 transition-colors"
        aria-label="Copy JSON to clipboard"
      >
        {isCopied ? <CheckIcon className="h-5 w-5 text-green-400" /> : <CopyIcon className="h-5 w-5" />}
      </button>
      <pre className={`p-4 text-sm whitespace-pre-wrap break-words overflow-auto h-full rounded-lg ${isPlaceholder ? 'text-slate-500' : 'text-slate-300'}`}>
        <code>{textToDisplay}</code>
      </pre>
    </div>
  );
};
