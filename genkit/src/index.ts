import { generate } from "@genkit-ai/ai";
import { configureGenkit } from "@genkit-ai/core";
import { defineFlow, runFlow } from "@genkit-ai/flow";
import express from "express";
import * as z from "zod";
import { ollama } from "genkitx-ollama";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

configureGenkit({
  plugins: [
    ollama({
      models: [
        {
          name: "llama3",
          type: "generate",
        },
      ],
      serverAddress: "http://127.0.0.1:11434",
    }),
  ],
  logLevel: "debug",
  enableTracingAndMetrics: true,
});


const summaryFlow = defineFlow(
  {
    name: "summaryFlow",
    inputSchema: z.object({
      longText: z.string(),
    }),
    outputSchema: z.string(),
  },
  async ({ longText }) => {
    if (!longText || typeof longText !== 'string') {
      throw new Error('Invalid input: longText must be a non-empty string');
    }

    const llmResponse = await generate({
      prompt: `Here is a long text. Please summarize it into 5 to 10 short strings. Each string should be concise, with a maximum of 4 to 5 words. Ensure the summary covers the main points or key ideas in the text.Don't include any unnecessary details like Here is a summary of the text in 5-10 short strings:Just start with the summary strings.

Long Text:
${longText}

Summary:`,
      model: "ollama/llama3",
      config: {
        temperature: 1,
      },
    });
    return llmResponse.text();
  }
);

app.post("/generate-summary", async (req, res) => {
  const { longText } = req.body;
  
  if (!longText) {
    return res.status(400).json({ error: "longText is required" });
  }

  try {
    const response = await runFlow(summaryFlow, { longText });
    res.status(200).json({ summary: response });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});