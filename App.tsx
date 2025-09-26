
import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { JsonDisplay } from './components/JsonDisplay';
import { SpinnerIcon } from './components/icons/SpinnerIcon';
import { generateJsonFromImage } from './services/geminiService';

function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [jsonOutput, setJsonOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback((file: File) => {
    setImageFile(file);
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageUrl(URL.createObjectURL(file));
    setJsonOutput('');
    setError(null);
  }, [imageUrl]);

  const handleConvert = async () => {
    if (!imageFile) {
      setError('Por favor, envie uma imagem primeiro.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setJsonOutput('');

    try {
      const resultJsonString = await generateJsonFromImage(imageFile);
      const parsedJson = JSON.parse(resultJsonString);
      const prettyJson = JSON.stringify(parsedJson, null, 2);
      setJsonOutput(prettyJson);
    } catch (err) {
      console.error(err);
      setError('Falha ao converter a imagem. Verifique o console para mais detalhes ou tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const exampleJson = `{
  "questions": [
    {
      "id": "pergunta_da_semana",
      "statement": "Qual iniciativa devemos priorizar?",
      "options": [
        { "id": "A", "text": "Treinamentos" },
        { "id": "B", "text": "Infraestrutura" },
        { "id": "C", "text": "Suporte aos alunos" }
      ]
    }
  ]
}`;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
            Gerador de JSON para Perguntas
          </h1>
          <p className="mt-4 text-lg text-slate-400 max-w-3xl mx-auto">
            Transforme prints de perguntas em JSON formatado. A IA extrai o texto da sua imagem e o estrutura no formato correto, pronto para ser usado.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 text-slate-100">1. Envie sua Imagem</h2>
              <ImageUploader onImageUpload={handleImageUpload} imageUrl={imageUrl} />
            </div>
             <button
              onClick={handleConvert}
              disabled={isLoading || !imageFile}
              className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 shadow-blue-500/50"
            >
              {isLoading && <SpinnerIcon />}
              {isLoading ? 'Convertendo...' : 'Converter para JSON'}
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-lg min-h-[300px]">
               <h2 className="text-2xl font-semibold mb-4 text-slate-100">2. Resultado em JSON</h2>
              {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
                  <strong className="font-bold">Erro: </strong>
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              <JsonDisplay jsonString={jsonOutput} placeholder={exampleJson} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
