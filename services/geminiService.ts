
import { GoogleGenAI, Type } from "@google/genai";

// This check is to prevent crashing in environments where process.env is not defined.
const apiKey = typeof process !== 'undefined' && process.env && process.env.API_KEY
  ? process.env.API_KEY
  : "YOUR_API_KEY_HERE"; // Fallback, but the app expects process.env.API_KEY

if (apiKey === "YOUR_API_KEY_HERE") {
    console.warn("API_KEY is not configured in environment variables.");
}

const ai = new GoogleGenAI({ apiKey });

// Helper function to convert a File object to a GoogleGenAI.Part object
async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}

const promptText = `
Você é um especialista em extrair dados de imagens e formatá-los em JSON.
Analise a imagem fornecida, que contém uma pergunta e várias alternativas de resposta.
Extraia as informações e formate-as estritamente de acordo com o schema JSON fornecido.

O formato de saída para cada pergunta deve ser:
{ "id": "nome_curto", "statement": "Pergunta exibida", "options": [ { "id": "A", "text": "Opção 1" }, { "id": "B", "text": "Opção 2" } ] }

Instruções para preenchimento:
1. "id": Crie um id curto, em snake_case (ex.: pergunta_unica), baseado no conteúdo da pergunta.
2. "statement": Escreva a frase exata da pergunta que os alunos verão.
3. "options": Liste cada alternativa. Para cada uma:
   - "id": Use o identificador curto da opção (ex: A, B, C, 1, 2, 3...).
   - "text": Escreva o texto completo da opção.

Retorne o resultado como um array de perguntas dentro de um objeto principal com a chave "questions".
Exemplo de saída para uma única pergunta:
{
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
}
`;

const schema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.STRING,
            description: "Um identificador curto e único para a pergunta, em formato snake_case.",
          },
          statement: {
            type: Type.STRING,
            description: "O texto completo da pergunta.",
          },
          options: {
            type: Type.ARRAY,
            description: "Uma lista de alternativas de resposta.",
            items: {
              type: Type.OBJECT,
              properties: {
                id: {
                  type: Type.STRING,
                  description: "O identificador da alternativa (ex: 'A', 'B', '1').",
                },
                text: {
                  type: Type.STRING,
                  description: "O texto completo da alternativa.",
                },
              },
              required: ["id", "text"],
            },
          },
        },
        required: ["id", "statement", "options"],
      },
    },
  },
  required: ["questions"],
};

export const generateJsonFromImage = async (imageFile: File): Promise<string> => {
  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    throw new Error("API key not found. Please set the API_KEY environment variable.");
  }
  
  const imagePart = await fileToGenerativePart(imageFile);

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, {text: promptText}] },
    config: {
        responseMimeType: "application/json",
        responseSchema: schema,
    }
  });

  const resultText = response.text;
  if (!resultText) {
    throw new Error("A API não retornou nenhum texto.");
  }
  
  return resultText;
};
