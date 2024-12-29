"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ai_1 = require("@genkit-ai/ai");
const core_1 = require("@genkit-ai/core");
const flow_1 = require("@genkit-ai/flow");
const express_1 = __importDefault(require("express"));
const z = __importStar(require("zod"));
const genkitx_ollama_1 = require("genkitx-ollama");
const cors_1 = __importDefault(require("cors"));
// import axios from "axios";
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("", (0, cors_1.default)());
(0, core_1.configureGenkit)({
    plugins: [
        (0, genkitx_ollama_1.ollama)({
            models: [
                {
                    name: "gemma:2b",
                    type: "generate",
                },
                {
                    name: "llama3",
                    type: "generate",
                }
            ],
            serverAddress: "http://127.0.0.1:11434", // default ollama local address
        }),
    ],
    logLevel: "debug",
    enableTracingAndMetrics: true,
});

const summaryFlow = (0, flow_1.defineFlow)(
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
  
      const llmResponse = await (0, ai_1.generate)({
        prompt: `Here is a long text. Please summarize it into 5 to 10 short strings. Each string should be concise, with a maximum of 4 to 5 words. Ensure the summary covers the main points or key ideas in the text.Here is a long text. Please summarize it into 5 to 10 short strings. Each string should be concise, with a maximum of 4 to 5 words. Ensure the summary covers the main points or key ideas in the text.Don't include any unnecessary details like Here is a summary of the text in 5-10 short strings:Just start with the summary strings.Long Text: ${longText}
  
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
    const response = await (0, flow_1.runFlow)(summaryFlow, { longText });
    res.status(200).json({ summary: response });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});
//103   837506
//103   837506
// Start the server
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    //startFlowsServer();
});
//# sourceMappingURL=index.js.map