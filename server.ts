import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" })); // Support larger CSV payloads

// Initialize Gemini if the key is available
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API Client initialized successfully.");
  } else {
    console.warn("GEMINI_API_KEY not found in environment variables. AI analysis features will be unavailable.");
  }
} catch (error) {
  console.error("Failed to initialize Gemini API Client:", error);
}

// REST API for QA CSV Analysis
app.post("/api/analyze", async (req, res) => {
  try {
    const { csvData, customCriteria, customInstruction } = req.body;
    
    if (!csvData || !Array.isArray(csvData) || csvData.length === 0) {
      return res.status(400).json({ error: "Missing or invalid csvData. It must be an array of records." });
    }

    if (!ai) {
      return res.status(503).json({ 
        error: "Gemini API key is not configured. Please add GEMINI_API_KEY in the Secrets panel." 
      });
    }

    // Prepare data summary to send to Gemini (keep it reasonably sized to avoid token overflow)
    const sampleRows = csvData.slice(0, 300);
    const dataSummary = JSON.stringify(sampleRows, null, 2);
    
    const prompt = `
Analyze the following QA Test/Defect CSV data and provide a professional, executive-grade QA Audit & Quality Report.
Total records analyzed: ${csvData.length} (Sample of up to 300 records shown below).

### Target Release Criteria:
${customCriteria || "Default release criteria (Pass rate > 95%, No critical/blocker bugs)."}

### Custom Request / Context:
${customInstruction || "None"}

### CSV Data (JSON format):
\`\`\`json
${dataSummary}
\`\`\`

Please output a structured JSON response following this exact schema:
{
  "executiveSummary": "A concise, high-level summary of the software quality, key accomplishments, and overall release readiness. Response language should match the custom request or default to Korean. Word count: ~100 words.",
  "releaseStatus": "Ready", "Conditional Release", or "Not Ready" based on target criteria,
  "releaseJustification": "A paragraph explaining why the release is ready, conditionally ready, or blocked based on the metrics. In Korean.",
  "keyMetrics": {
    "totalTests": "estimated total tests or cases",
    "passRate": "estimated pass rate or bug clear rate",
    "defectDensity": "e.g., number of high/critical defects per module"
  },
  "topRisks": [
    {
      "risk": "Brief risk description in Korean (e.g. High regression rate in payment module)",
      "impact": "High/Medium/Low",
      "mitigation": "Recommended developer action in Korean"
    }
  ],
  "moduleInsights": [
    {
      "module": "Name of module",
      "issueCount": 3,
      "summary": "Short explanation of defect/failure trend in this component in Korean"
    }
  ],
  "recommendations": [
    "Actionable bullet point for the dev/QA team to improve quality in Korean"
  ],
  "releaseReadinessScore": 85 // A score from 0 to 100
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["executiveSummary", "releaseStatus", "releaseJustification", "topRisks", "moduleInsights", "recommendations", "releaseReadinessScore"],
          properties: {
            executiveSummary: { type: Type.STRING },
            releaseStatus: { type: Type.STRING },
            releaseJustification: { type: Type.STRING },
            keyMetrics: {
              type: Type.OBJECT,
              properties: {
                totalTests: { type: Type.STRING },
                passRate: { type: Type.STRING },
                defectDensity: { type: Type.STRING }
              }
            },
            topRisks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["risk", "impact", "mitigation"],
                properties: {
                  risk: { type: Type.STRING },
                  impact: { type: Type.STRING },
                  mitigation: { type: Type.STRING }
                }
              }
            },
            moduleInsights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["module", "issueCount", "summary"],
                properties: {
                  module: { type: Type.STRING },
                  issueCount: { type: Type.INTEGER },
                  summary: { type: Type.STRING }
                }
              }
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            releaseReadinessScore: { type: Type.INTEGER }
          }
        },
        systemInstruction: "You are an expert Principal QA Engineer and Software Quality Architect. Always provide rigorous, data-driven, and highly actionable analysis of test data and bug logs. Your output must be valid, well-structured JSON as specified. Write explanations and titles in Korean unless English is requested."
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response received from Gemini");
    }

    const report = JSON.parse(resultText);
    res.json(report);

  } catch (error: any) {
    console.error("Error analyzing CSV data:", error);
    res.status(500).json({ error: error?.message || "Internal server error during analysis." });
  }
});

// Chat / QA Assistant API
app.post("/api/chat", async (req, res) => {
  try {
    const { csvData, history, message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Missing message parameter." });
    }

    if (!ai) {
      return res.status(503).json({ 
        error: "Gemini API key is not configured. Please add GEMINI_API_KEY in the Secrets panel." 
      });
    }

    const dataSummary = JSON.stringify((csvData || []).slice(0, 300), null, 2);

    const systemPrompt = `
You are the "AI QA Assistant" in a professional Software Quality Assurance dashboard app.
You help software engineering teams, QA leads, and product managers interpret their CSV-based test results, defect metrics, and quality trends.

Below is the active QA CSV dataset (up to 300 rows) loaded in the user's dashboard:
\`\`\`json
${dataSummary}
\`\`\`

When answering questions:
1. Refer directly to the numbers, modules, severities, or trends in the data.
2. Be precise, helpful, and concise.
3. You can format your output with clean Markdown (bold, bullet points, tiny tables, code blocks).
4. Do NOT larp or hallucinate. If you can't find an answer in the data, explain what might be missing (e.g., "The CSV doesn't seem to contain a 'Date' or 'Severity' column, so I cannot determine the bug trend...").
5. Speak in the user's language. If they ask in Korean, respond in Korean.
`;

    let fullPrompt = `${systemPrompt}\n\n`;
    if (history && Array.isArray(history)) {
      for (const turn of history) {
        fullPrompt += `${turn.role === 'user' ? 'User' : 'Assistant'}: ${turn.content}\n`;
      }
    }
    fullPrompt += `User: ${message}\nAssistant:`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: fullPrompt,
    });

    res.json({ text: response.text });

  } catch (error: any) {
    console.error("Error in QA Chat Assistant:", error);
    res.status(500).json({ error: error?.message || "Internal server error during chat." });
  }
});

// Serve static assets / Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
