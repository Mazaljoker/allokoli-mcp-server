#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Configuration MCP
const MCP_CONFIG = {
  name: "allokoli-mcp-clean",
  version: "2.0.0",
  description: "Serveur MCP AlloKoli conforme à l'API Vapi.ai officielle",
};

// Fonction pour charger les variables d'environnement depuis .env
function loadEnvFile() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  // Chercher le fichier .env dans plusieurs emplacements
  const envPaths = [
    join(__dirname, ".env"), // Dans le répertoire allokoli-mcp-server
    join(__dirname, "..", ".env"), // Dans le répertoire parent (racine du projet)
    join(process.cwd(), ".env"), // Dans le répertoire de travail actuel
  ];

  for (const envPath of envPaths) {
    if (existsSync(envPath)) {
      console.log(`📁 Chargement du fichier .env depuis: ${envPath}`);
      try {
        const envContent = readFileSync(envPath, "utf8");
        const lines = envContent.split("\n");

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine && !trimmedLine.startsWith("#")) {
            const [key, ...valueParts] = trimmedLine.split("=");
            if (key && valueParts.length > 0) {
              const value = valueParts.join("=").replace(/^["']|["']$/g, "");
              if (!process.env[key.trim()]) {
                process.env[key.trim()] = value;
              }
            }
          }
        }
        console.log(`✅ Variables d'environnement chargées depuis ${envPath}`);
        return true;
      } catch (error) {
        console.warn(
          `⚠️ Erreur lors du chargement de ${envPath}:`,
          error.message
        );
      }
    }
  }

  console.log(`📋 Aucun fichier .env trouvé dans: ${envPaths.join(", ")}`);
  return false;
}

// Charger les variables d'environnement
loadEnvFile();

// Variables d'environnement
const VAPI_API_KEY = process.env.VAPI_API_KEY;
const VAPI_BASE_URL = process.env.VAPI_BASE_URL || "https://api.vapi.ai";

console.log(`🔑 VAPI_API_KEY: ${VAPI_API_KEY ? "✅ Définie" : "❌ Manquante"}`);
console.log(`🌐 VAPI_BASE_URL: ${VAPI_BASE_URL}`);

if (!VAPI_API_KEY) {
  console.error(
    "❌ ERREUR: VAPI_API_KEY manquante dans les variables d'environnement"
  );
  console.error("💡 Solutions possibles:");
  console.error("   1. Créer un fichier .env avec VAPI_API_KEY=votre_clé");
  console.error("   2. Exporter la variable: export VAPI_API_KEY=votre_clé");
  console.error(
    "   3. Passer la variable: VAPI_API_KEY=votre_clé node index-clean.js"
  );
  process.exit(1);
}

// Headers communs pour les requêtes Vapi
const getVapiHeaders = () => ({
  Authorization: `Bearer ${VAPI_API_KEY}`,
  "Content-Type": "application/json",
});

// Initialisation du serveur MCP
const server = new McpServer({
  name: MCP_CONFIG.name,
  version: MCP_CONFIG.version,
});

// ========================================
// ASSISTANTS - Endpoints officiels Vapi
// ========================================

// GET /assistant - List Assistants
server.tool(
  "listVapiAssistants",
  {
    limit: z
      .number()
      .optional()
      .describe("Nombre maximum d'assistants à retourner (max 1000)"),
    createdAtGt: z
      .string()
      .optional()
      .describe("Filtrer par date de création supérieure à"),
    createdAtLt: z
      .string()
      .optional()
      .describe("Filtrer par date de création inférieure à"),
  },
  async (args) => {
    try {
      const params = new URLSearchParams();
      if (args.limit) params.append("limit", args.limit.toString());
      if (args.createdAtGt) params.append("createdAtGt", args.createdAtGt);
      if (args.createdAtLt) params.append("createdAtLt", args.createdAtLt);

      const url = `${VAPI_BASE_URL}/assistant${
        params.toString() ? "?" + params.toString() : ""
      }`;
      const response = await fetch(url, {
        method: "GET",
        headers: getVapiHeaders(),
      });

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// POST /assistant - Create Assistant
server.tool(
  "createVapiAssistant",
  {
    name: z.string().optional().describe("Nom de l'assistant"),
    firstMessage: z
      .string()
      .optional()
      .describe("Premier message de l'assistant"),
    systemMessage: z
      .string()
      .optional()
      .describe("Message système pour l'assistant"),
    model: z
      .object({
        provider: z.string().describe("Fournisseur du modèle (ex: openai)"),
        model: z.string().describe("Nom du modèle (ex: gpt-4)"),
      })
      .optional()
      .describe("Configuration du modèle"),
    voice: z
      .object({
        provider: z
          .string()
          .describe("Fournisseur de la voix (ex: elevenlabs)"),
        voiceId: z.string().describe("ID de la voix"),
      })
      .optional()
      .describe("Configuration de la voix"),
  },
  async (args) => {
    try {
      const response = await fetch(`${VAPI_BASE_URL}/assistant`, {
        method: "POST",
        headers: getVapiHeaders(),
        body: JSON.stringify(args),
      });

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// GET /assistant/{id} - Get Assistant
server.tool(
  "getVapiAssistant",
  {
    assistantId: z.string().describe("ID de l'assistant Vapi"),
  },
  async (args) => {
    try {
      const response = await fetch(
        `${VAPI_BASE_URL}/assistant/${args.assistantId}`,
        {
          method: "GET",
          headers: getVapiHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// PATCH /assistant/{id} - Update Assistant
server.tool(
  "updateVapiAssistant",
  {
    assistantId: z.string().describe("ID de l'assistant Vapi"),
    updates: z
      .object({
        name: z.string().optional().describe("Nouveau nom"),
        firstMessage: z.string().optional().describe("Nouveau premier message"),
        model: z
          .object({
            provider: z.string().optional(),
            model: z.string().optional(),
            systemMessage: z.string().optional(),
          })
          .optional()
          .describe("Mises à jour du modèle"),
      })
      .describe("Mises à jour à appliquer"),
  },
  async (args) => {
    try {
      const response = await fetch(
        `${VAPI_BASE_URL}/assistant/${args.assistantId}`,
        {
          method: "PATCH",
          headers: getVapiHeaders(),
          body: JSON.stringify(args.updates),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// DELETE /assistant/{id} - Delete Assistant
server.tool(
  "deleteVapiAssistant",
  {
    assistantId: z.string().describe("ID de l'assistant Vapi à supprimer"),
  },
  async (args) => {
    try {
      const response = await fetch(
        `${VAPI_BASE_URL}/assistant/${args.assistantId}`,
        {
          method: "DELETE",
          headers: getVapiHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      return {
        content: [
          {
            type: "text",
            text: `Assistant ${args.assistantId} supprimé avec succès`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// ========================================
// CALLS - Endpoints officiels Vapi
// ========================================

// GET /call - List Calls
server.tool(
  "listVapiCalls",
  {
    limit: z
      .number()
      .optional()
      .describe("Nombre maximum d'appels à retourner"),
    assistantId: z.string().optional().describe("Filtrer par ID d'assistant"),
    phoneNumberId: z
      .string()
      .optional()
      .describe("Filtrer par ID de numéro de téléphone"),
  },
  async (args) => {
    try {
      const params = new URLSearchParams();
      if (args.limit) params.append("limit", args.limit.toString());
      if (args.assistantId) params.append("assistantId", args.assistantId);
      if (args.phoneNumberId)
        params.append("phoneNumberId", args.phoneNumberId);

      const url = `${VAPI_BASE_URL}/call${
        params.toString() ? "?" + params.toString() : ""
      }`;
      const response = await fetch(url, {
        method: "GET",
        headers: getVapiHeaders(),
      });

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// POST /call - Create Call
server.tool(
  "createVapiCall",
  {
    type: z
      .enum(["outboundPhoneCall", "inboundPhoneCall", "webCall"])
      .describe("Type d'appel"),
    assistantId: z.string().optional().describe("ID de l'assistant à utiliser"),
    phoneNumberId: z.string().optional().describe("ID du numéro de téléphone"),
    customer: z
      .object({
        number: z.string().describe("Numéro de téléphone du client"),
      })
      .optional()
      .describe("Informations du client"),
    name: z.string().optional().describe("Nom de l'appel"),
  },
  async (args) => {
    try {
      const response = await fetch(`${VAPI_BASE_URL}/call`, {
        method: "POST",
        headers: getVapiHeaders(),
        body: JSON.stringify(args),
      });

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// GET /call/{id} - Get Call
server.tool(
  "getVapiCall",
  {
    callId: z.string().describe("ID de l'appel Vapi"),
  },
  async (args) => {
    try {
      const response = await fetch(`${VAPI_BASE_URL}/call/${args.callId}`, {
        method: "GET",
        headers: getVapiHeaders(),
      });

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// PATCH /call/{id} - Update Call
server.tool(
  "updateVapiCall",
  {
    callId: z.string().describe("ID de l'appel Vapi"),
    updates: z
      .object({
        name: z.string().optional().describe("Nouveau nom de l'appel"),
        assistantId: z.string().optional().describe("Nouvel assistant ID"),
        metadata: z
          .record(z.any())
          .optional()
          .describe("Nouvelles métadonnées"),
      })
      .describe("Mises à jour à appliquer"),
  },
  async (args) => {
    try {
      const response = await fetch(`${VAPI_BASE_URL}/call/${args.callId}`, {
        method: "PATCH",
        headers: getVapiHeaders(),
        body: JSON.stringify(args.updates),
      });

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// DELETE /call/{id} - Delete Call Data
server.tool(
  "deleteVapiCall",
  {
    callId: z.string().describe("ID de l'appel Vapi à supprimer"),
  },
  async (args) => {
    try {
      const response = await fetch(`${VAPI_BASE_URL}/call/${args.callId}`, {
        method: "DELETE",
        headers: getVapiHeaders(),
      });

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      return {
        content: [
          {
            type: "text",
            text: `Données de l'appel ${args.callId} supprimées avec succès`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// ========================================
// PHONE NUMBERS - Endpoints officiels Vapi
// ========================================

// GET /phone-number - List Phone Numbers
server.tool(
  "listVapiPhoneNumbers",
  {
    limit: z
      .number()
      .optional()
      .describe("Nombre maximum de numéros à retourner"),
  },
  async (args) => {
    try {
      const params = new URLSearchParams();
      if (args.limit) params.append("limit", args.limit.toString());

      const url = `${VAPI_BASE_URL}/phone-number${
        params.toString() ? "?" + params.toString() : ""
      }`;
      const response = await fetch(url, {
        method: "GET",
        headers: getVapiHeaders(),
      });

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// POST /phone-number - Create Phone Number
server.tool(
  "createVapiPhoneNumber",
  {
    name: z.string().optional().describe("Nom du numéro de téléphone"),
    assistantId: z.string().optional().describe("ID de l'assistant à associer"),
    fallbackDestination: z
      .object({
        type: z.string().describe("Type de destination de fallback"),
        number: z.string().describe("Numéro de fallback"),
      })
      .optional()
      .describe("Destination de fallback"),
  },
  async (args) => {
    try {
      const response = await fetch(`${VAPI_BASE_URL}/phone-number`, {
        method: "POST",
        headers: getVapiHeaders(),
        body: JSON.stringify(args),
      });

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// GET /phone-number/{id} - Get Phone Number
server.tool(
  "getVapiPhoneNumber",
  {
    phoneNumberId: z.string().describe("ID du numéro de téléphone"),
  },
  async (args) => {
    try {
      const response = await fetch(
        `${VAPI_BASE_URL}/phone-number/${args.phoneNumberId}`,
        {
          method: "GET",
          headers: getVapiHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// PATCH /phone-number/{id} - Update Phone Number
server.tool(
  "updateVapiPhoneNumber",
  {
    phoneNumberId: z.string().describe("ID du numéro de téléphone"),
    updates: z
      .object({
        name: z.string().optional().describe("Nouveau nom"),
        assistantId: z.string().optional().describe("Nouvel assistant ID"),
      })
      .describe("Mises à jour à appliquer"),
  },
  async (args) => {
    try {
      const response = await fetch(
        `${VAPI_BASE_URL}/phone-number/${args.phoneNumberId}`,
        {
          method: "PATCH",
          headers: getVapiHeaders(),
          body: JSON.stringify(args.updates),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// DELETE /phone-number/{id} - Delete Phone Number
server.tool(
  "deleteVapiPhoneNumber",
  {
    phoneNumberId: z.string().describe("ID du numéro de téléphone à supprimer"),
  },
  async (args) => {
    try {
      const response = await fetch(
        `${VAPI_BASE_URL}/phone-number/${args.phoneNumberId}`,
        {
          method: "DELETE",
          headers: getVapiHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      return {
        content: [
          {
            type: "text",
            text: `Numéro de téléphone ${args.phoneNumberId} supprimé avec succès`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// ========================================
// TOOLS - Endpoints officiels Vapi
// ========================================

// GET /tool - List Tools
server.tool(
  "listVapiTools",
  {
    limit: z
      .number()
      .optional()
      .describe("Nombre maximum d'outils à retourner"),
  },
  async (args) => {
    try {
      const params = new URLSearchParams();
      if (args.limit) params.append("limit", args.limit.toString());

      const url = `${VAPI_BASE_URL}/tool${
        params.toString() ? "?" + params.toString() : ""
      }`;
      const response = await fetch(url, {
        method: "GET",
        headers: getVapiHeaders(),
      });

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// GET /tool/{id} - Get Tool
server.tool(
  "getVapiTool",
  {
    toolId: z.string().describe("ID de l'outil Vapi"),
  },
  async (args) => {
    try {
      const response = await fetch(`${VAPI_BASE_URL}/tool/${args.toolId}`, {
        method: "GET",
        headers: getVapiHeaders(),
      });

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// ========================================
// FILES - Endpoints officiels Vapi
// ========================================

// GET /file - List Files
server.tool(
  "listVapiFiles",
  {
    limit: z
      .number()
      .optional()
      .describe("Nombre maximum de fichiers à retourner"),
  },
  async (args) => {
    try {
      const params = new URLSearchParams();
      if (args.limit) params.append("limit", args.limit.toString());

      const url = `${VAPI_BASE_URL}/file${
        params.toString() ? "?" + params.toString() : ""
      }`;
      const response = await fetch(url, {
        method: "GET",
        headers: getVapiHeaders(),
      });

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// ========================================
// KNOWLEDGE BASES - Endpoints officiels Vapi
// ========================================

// GET /knowledge-base - List Knowledge Bases
server.tool(
  "listVapiKnowledgeBases",
  {
    limit: z
      .number()
      .optional()
      .describe("Nombre maximum de bases de connaissances à retourner"),
  },
  async (args) => {
    try {
      const params = new URLSearchParams();
      if (args.limit) params.append("limit", args.limit.toString());

      const url = `${VAPI_BASE_URL}/knowledge-base${
        params.toString() ? "?" + params.toString() : ""
      }`;
      const response = await fetch(url, {
        method: "GET",
        headers: getVapiHeaders(),
      });

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// ========================================
// SQUADS - Endpoints officiels Vapi
// ========================================

// GET /squad - List Squads
server.tool(
  "listVapiSquads",
  {
    limit: z
      .number()
      .optional()
      .describe("Nombre maximum d'équipes à retourner"),
  },
  async (args) => {
    try {
      const params = new URLSearchParams();
      if (args.limit) params.append("limit", args.limit.toString());

      const url = `${VAPI_BASE_URL}/squad${
        params.toString() ? "?" + params.toString() : ""
      }`;
      const response = await fetch(url, {
        method: "GET",
        headers: getVapiHeaders(),
      });

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// ========================================
// ANALYTICS - Endpoints officiels Vapi
// ========================================

// POST /analytics - Create Analytics Queries
server.tool(
  "createVapiAnalyticsQueries",
  {
    queries: z
      .array(
        z.object({
          name: z.string().describe("Nom de la requête"),
          query: z.string().describe("Requête d'analyse"),
        })
      )
      .describe("Requêtes d'analyse à créer"),
  },
  async (args) => {
    try {
      const response = await fetch(`${VAPI_BASE_URL}/analytics`, {
        method: "POST",
        headers: getVapiHeaders(),
        body: JSON.stringify(args),
      });

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// ========================================
// LOGS - Endpoints officiels Vapi
// ========================================

// GET /logs - Get Logs
server.tool(
  "getVapiLogs",
  {
    level: z
      .enum(["INFO", "WARN", "ERROR"])
      .optional()
      .describe("Niveau de log"),
    limit: z.number().optional().describe("Nombre maximum de logs à retourner"),
  },
  async (args) => {
    try {
      const params = new URLSearchParams();
      if (args.level) params.append("level", args.level);
      if (args.limit) params.append("limit", args.limit.toString());

      const url = `${VAPI_BASE_URL}/logs${
        params.toString() ? "?" + params.toString() : ""
      }`;
      const response = await fetch(url, {
        method: "GET",
        headers: getVapiHeaders(),
      });

      if (!response.ok) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// ========================================
// DÉMARRAGE DU SERVEUR
// ========================================

async function main() {
  const transport = process.argv.includes("--stdio")
    ? new StdioServerTransport()
    : new SSEServerTransport("/message", process.env.PORT || 3000);

  await server.connect(transport);
  console.log(
    `🚀 Serveur MCP AlloKoli Clean démarré sur le port ${
      process.env.PORT || 3000
    }`
  );
  console.log(
    `📋 ${Object.keys(server._tools).length} outils Vapi officiels disponibles`
  );
}

// Gestion des erreurs
process.on("SIGINT", async () => {
  console.log("\n🛑 Arrêt du serveur MCP...");
  await server.close();
  process.exit(0);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Erreur non gérée:", error);
  process.exit(1);
});

// Démarrage
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("❌ Erreur lors du démarrage:", error);
    process.exit(1);
  });
}
