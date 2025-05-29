#!/usr/bin/env node
// AlloKoli MCP Server - Version Node.js adaptee pour Smithery
// Adapte automatiquement du code Deno original

// Configuration des variables d'environnement
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger le fichier .env du répertoire parent
dotenv.config({ path: join(__dirname, "..", ".env") });

// Debug des variables d'environnement
console.log("Variables d'environnement chargées:");
console.log(
  "SUPABASE_URL:",
  process.env.SUPABASE_URL ? "Définie" : "Non définie"
);
console.log(
  "SUPABASE_SERVICE_ROLE_KEY:",
  process.env.SUPABASE_SERVICE_ROLE_KEY ? "Définie" : "Non définie"
);
console.log(
  "SUPABASE_ANON_KEY:",
  process.env.SUPABASE_ANON_KEY ? "Définie" : "Non définie"
);
console.log(
  "VAPI_API_KEY:",
  process.env.VAPI_API_KEY ? "Définie" : "Non définie"
);
console.log(
  "TWILIO_ACCOUNT_SID:",
  process.env.TWILIO_ACCOUNT_SID ? "Définie" : "Non définie"
);
console.log(
  "TWILIO_AUTH_TOKEN:",
  process.env.TWILIO_AUTH_TOKEN ? "Définie" : "Non définie"
);

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";
import { z } from "zod";

// Configuration MCP
const MCP_CONFIG = {
  name: "allokoli-mcp-server",
  version: "1.0.0",
  description:
    "Serveur MCP AlloKoli pour la creation et gestion d'assistants vocaux",
};

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuration Twilio
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

// Configuration Vapi
const vapiApiKey = process.env.VAPI_API_KEY;

// Initialisation du serveur MCP avec la nouvelle syntaxe
const server = new McpServer({
  name: MCP_CONFIG.name,
  version: MCP_CONFIG.version,
});

// Outil pour créer un assistant et provisionner un numéro
server.tool(
  "createAssistantAndProvisionNumber",
  {
    assistantName: z.string().describe("Nom de l'assistant vocal"),
    businessType: z.string().describe("Type d'activité de l'entreprise"),
    assistantTone: z.string().describe("Ton de communication de l'assistant"),
    firstMessage: z.string().describe("Message d'accueil de l'assistant"),
    systemPromptCore: z.string().describe("Prompt système principal"),
    canTakeReservations: z
      .boolean()
      .optional()
      .describe("L'assistant peut-il prendre des réservations"),
    canTakeAppointments: z
      .boolean()
      .optional()
      .describe("L'assistant peut-il prendre des rendez-vous"),
    canTransferCall: z
      .boolean()
      .optional()
      .describe("L'assistant peut-il transférer des appels"),
    companyName: z.string().optional().describe("Nom de l'entreprise"),
    address: z.string().optional().describe("Adresse de l'entreprise"),
    phoneNumber: z
      .string()
      .optional()
      .describe("Numéro de téléphone de l'entreprise"),
    email: z.string().optional().describe("Email de l'entreprise"),
    openingHours: z.string().optional().describe("Horaires d'ouverture"),
  },
  async (args) => {
    try {
      const userId = "user-demo";
      const result = await createAssistantAndProvisionNumber(args, userId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour provisionner un numéro de téléphone
server.tool(
  "provisionPhoneNumber",
  {
    country: z.string().describe("Code pays (ex: FR, US)"),
    areaCode: z.string().optional().describe("Indicatif régional"),
    contains: z
      .string()
      .optional()
      .describe("Pattern de recherche dans le numéro"),
    assistantId: z.string().optional().describe("ID de l'assistant à associer"),
  },
  async (args) => {
    try {
      const userId = "user-demo";
      const result = await provisionPhoneNumber(args, userId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour lister les assistants
server.tool(
  "listAssistants",
  {
    page: z.number().optional().describe("Numéro de page"),
    limit: z.number().optional().describe("Nombre d'éléments par page"),
    search: z.string().optional().describe("Recherche par nom"),
    sector: z.string().optional().describe("Filtrer par secteur d'activité"),
  },
  async (args) => {
    try {
      const userId = "user-demo";
      const result = await listAssistants(args, userId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour récupérer un assistant
server.tool(
  "getAssistant",
  {
    assistantId: z.string().describe("ID unique de l'assistant"),
  },
  async (args) => {
    try {
      const userId = "user-demo";
      const result = await getAssistant(args, userId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour mettre à jour un assistant
server.tool(
  "updateAssistant",
  {
    assistantId: z.string().describe("ID unique de l'assistant"),
    updates: z
      .object({
        name: z.string().optional().describe("Nouveau nom de l'assistant"),
        systemPrompt: z.string().optional().describe("Nouveau prompt système"),
        firstMessage: z
          .string()
          .optional()
          .describe("Nouveau message d'accueil"),
        endCallMessage: z
          .string()
          .optional()
          .describe("Nouveau message de fin d'appel"),
        isActive: z.boolean().optional().describe("Statut actif/inactif"),
      })
      .describe("Mises à jour à appliquer"),
  },
  async (args) => {
    try {
      const userId = "user-demo";
      const result = await updateAssistant(args, userId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour lister les assistants Vapi
server.tool(
  "listVapiAssistants",
  {
    limit: z
      .number()
      .optional()
      .describe("Nombre maximum d'assistants à retourner"),
  },
  async (args) => {
    try {
      const result = await listVapiAssistants(args.limit);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour récupérer un assistant Vapi
server.tool(
  "getVapiAssistant",
  {
    assistantId: z.string().describe("ID de l'assistant Vapi"),
  },
  async (args) => {
    try {
      const result = await getVapiAssistant(args.assistantId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour mettre à jour un assistant Vapi
server.tool(
  "updateVapiAssistant",
  {
    assistantId: z.string().describe("ID de l'assistant Vapi"),
    updates: z
      .object({
        name: z.string().optional().describe("Nouveau nom"),
        firstMessage: z
          .string()
          .optional()
          .describe("Nouveau message d'accueil"),
        model: z
          .object({
            provider: z.string().optional(),
            model: z.string().optional(),
            systemMessage: z.string().optional(),
          })
          .optional()
          .describe("Configuration du modèle"),
      })
      .describe("Mises à jour à appliquer"),
  },
  async (args) => {
    try {
      const result = await updateVapiAssistant(args.assistantId, args.updates);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour supprimer un assistant Vapi
server.tool(
  "deleteVapiAssistant",
  {
    assistantId: z.string().describe("ID de l'assistant Vapi à supprimer"),
  },
  async (args) => {
    try {
      const result = await deleteVapiAssistant(args.assistantId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour lister les appels Vapi
server.tool(
  "listVapiCalls",
  {
    limit: z
      .number()
      .optional()
      .describe("Nombre maximum d'appels à retourner"),
  },
  async (args) => {
    try {
      const result = await listVapiCalls(args.limit);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour créer un appel Vapi
server.tool(
  "createVapiCall",
  {
    assistantId: z.string().optional().describe("ID de l'assistant à utiliser"),
    phoneNumberId: z.string().optional().describe("ID du numéro de téléphone"),
    customer: z
      .object({
        number: z.string().describe("Numéro de téléphone du client"),
      })
      .optional()
      .describe("Informations du client"),
    type: z
      .enum(["outboundPhoneCall", "inboundPhoneCall", "webCall"])
      .describe("Type d'appel"),
  },
  async (args) => {
    try {
      const result = await createVapiCall(args);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// ===== OUTILS VAPI CALLS COMPLÉMENTAIRES =====

// Outil pour récupérer un appel Vapi
server.tool(
  "getVapiCall",
  {
    callId: z.string().describe("ID de l'appel Vapi"),
  },
  async (args) => {
    try {
      const result = await getVapiCall(args.callId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour mettre à jour un appel Vapi
server.tool(
  "updateVapiCall",
  {
    callId: z.string().describe("ID de l'appel Vapi"),
    updates: z
      .object({
        name: z.string().optional().describe("Nouveau nom de l'appel"),
        assistantId: z.string().optional().describe("Nouvel assistant ID"),
        assistantOverrides: z.any().optional().describe("Surcharges assistant"),
        squadId: z.string().optional().describe("Nouveau squad ID"),
        metadata: z
          .record(z.any())
          .optional()
          .describe("Nouvelles métadonnées"),
      })
      .describe("Mises à jour à appliquer"),
  },
  async (args) => {
    try {
      const result = await updateVapiCall(args.callId, args.updates);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour supprimer un appel Vapi
server.tool(
  "deleteVapiCall",
  {
    callId: z.string().describe("ID de l'appel Vapi à supprimer"),
  },
  async (args) => {
    try {
      const result = await deleteVapiCall(args.callId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour raccrocher un appel Vapi
server.tool(
  "hangupVapiCall",
  {
    callId: z.string().describe("ID de l'appel Vapi à raccrocher"),
  },
  async (args) => {
    try {
      const result = await hangupVapiCall(args.callId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour exécuter une fonction sur un appel Vapi
server.tool(
  "functionCallVapi",
  {
    callId: z.string().describe("ID de l'appel Vapi"),
    functionCall: z
      .object({
        name: z.string().describe("Nom de la fonction à exécuter"),
        parameters: z.any().optional().describe("Paramètres de la fonction"),
      })
      .describe("Appel de fonction à exécuter"),
  },
  async (args) => {
    try {
      const result = await functionCallVapi(args.callId, args.functionCall);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour faire parler l'assistant sur un appel Vapi
server.tool(
  "sayVapiCall",
  {
    callId: z.string().describe("ID de l'appel Vapi"),
    message: z.string().describe("Message à faire dire par l'assistant"),
  },
  async (args) => {
    try {
      const result = await sayVapiCall(args.callId, args.message);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour lister les numéros de téléphone Vapi
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
      const result = await listVapiPhoneNumbers(args.limit);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour acheter un numéro de téléphone Vapi
server.tool(
  "buyVapiPhoneNumber",
  {
    areaCode: z.string().optional().describe("Indicatif régional"),
    name: z.string().optional().describe("Nom du numéro"),
    assistantId: z.string().optional().describe("ID de l'assistant à associer"),
    serverUrl: z.string().optional().describe("URL du serveur webhook"),
    serverUrlSecret: z.string().optional().describe("Secret pour le webhook"),
  },
  async (args) => {
    try {
      const result = await buyVapiPhoneNumber(args);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour récupérer un numéro de téléphone Vapi
server.tool(
  "getVapiPhoneNumber",
  {
    phoneNumberId: z.string().describe("ID du numéro de téléphone Vapi"),
  },
  async (args) => {
    try {
      const result = await getVapiPhoneNumber(args.phoneNumberId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour mettre à jour un numéro de téléphone Vapi
server.tool(
  "updateVapiPhoneNumber",
  {
    phoneNumberId: z.string().describe("ID du numéro de téléphone Vapi"),
    updates: z
      .object({
        name: z.string().optional().describe("Nouveau nom"),
        assistantId: z.string().optional().describe("Nouvel assistant ID"),
        serverUrl: z.string().optional().describe("Nouvelle URL webhook"),
        serverUrlSecret: z
          .string()
          .optional()
          .describe("Nouveau secret webhook"),
      })
      .describe("Mises à jour à appliquer"),
  },
  async (args) => {
    try {
      const result = await updateVapiPhoneNumber(
        args.phoneNumberId,
        args.updates
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour supprimer un numéro de téléphone Vapi
server.tool(
  "deleteVapiPhoneNumber",
  {
    phoneNumberId: z
      .string()
      .describe("ID du numéro de téléphone Vapi à supprimer"),
  },
  async (args) => {
    try {
      const result = await deleteVapiPhoneNumber(args.phoneNumberId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// ===== NOUVEAUX OUTILS VAPI TOOLS =====

// Outil pour lister les outils Vapi
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
      const result = await listVapiTools(args.limit);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour créer un outil Vapi
server.tool(
  "createVapiTool",
  {
    name: z.string().describe("Nom de l'outil"),
    description: z.string().describe("Description de l'outil"),
    url: z.string().describe("URL de l'endpoint de l'outil"),
    parameters: z
      .any()
      .optional()
      .describe("Paramètres de la fonction (schema JSON)"),
    headers: z.record(z.string()).optional().describe("Headers HTTP"),
    async: z.boolean().optional().describe("Exécution asynchrone"),
    timeoutSeconds: z.number().optional().describe("Timeout en secondes"),
  },
  async (args) => {
    try {
      const result = await createVapiTool(args);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour récupérer un outil Vapi
server.tool(
  "getVapiTool",
  {
    toolId: z.string().describe("ID de l'outil Vapi"),
  },
  async (args) => {
    try {
      const result = await getVapiTool(args.toolId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour mettre à jour un outil Vapi
server.tool(
  "updateVapiTool",
  {
    toolId: z.string().describe("ID de l'outil Vapi"),
    updates: z
      .object({
        name: z.string().optional().describe("Nouveau nom"),
        description: z.string().optional().describe("Nouvelle description"),
        url: z.string().optional().describe("Nouvelle URL"),
        method: z
          .enum(["GET", "POST", "PUT", "PATCH", "DELETE"])
          .optional()
          .describe("Nouvelle méthode HTTP"),
        headers: z.record(z.string()).optional().describe("Nouveaux headers"),
        body: z.any().optional().describe("Nouveau corps de requête"),
        async: z.boolean().optional().describe("Nouvelle configuration async"),
        timeoutSeconds: z.number().optional().describe("Nouveau timeout"),
      })
      .describe("Mises à jour à appliquer"),
  },
  async (args) => {
    try {
      const result = await updateVapiTool(args.toolId, args.updates);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour supprimer un outil Vapi
server.tool(
  "deleteVapiTool",
  {
    toolId: z.string().describe("ID de l'outil Vapi à supprimer"),
  },
  async (args) => {
    try {
      const result = await deleteVapiTool(args.toolId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// ===== NOUVEAUX OUTILS VAPI KNOWLEDGE BASES =====

// Outil pour lister les bases de connaissances Vapi
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
      const result = await listVapiKnowledgeBases(args.limit);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour créer une base de connaissances Vapi
server.tool(
  "createVapiKnowledgeBase",
  {
    provider: z
      .enum(["trieve", "custom-knowledge-base"])
      .describe("Provider de la base de connaissances"),
    name: z.string().optional().describe("Nom de la base de connaissances"),
    providerId: z
      .string()
      .optional()
      .describe("ID du dataset Trieve (requis pour Trieve)"),
    searchType: z
      .enum(["fulltext", "semantic", "hybrid"])
      .optional()
      .describe("Type de recherche"),
    topK: z.number().optional().describe("Nombre de résultats à retourner"),
    removeStopWords: z
      .boolean()
      .optional()
      .describe("Supprimer les mots vides"),
    scoreThreshold: z.number().optional().describe("Seuil de score minimum"),
    server: z
      .object({
        url: z.string().describe("URL du serveur de base de connaissances"),
        timeoutSeconds: z.number().optional().describe("Timeout en secondes"),
      })
      .optional()
      .describe("Configuration du serveur (pour custom-knowledge-base)"),
  },
  async (args) => {
    try {
      const result = await createVapiKnowledgeBase(args);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour récupérer une base de connaissances Vapi
server.tool(
  "getVapiKnowledgeBase",
  {
    knowledgeBaseId: z.string().describe("ID de la base de connaissances Vapi"),
  },
  async (args) => {
    try {
      const result = await getVapiKnowledgeBase(args.knowledgeBaseId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour mettre à jour une base de connaissances Vapi
server.tool(
  "updateVapiKnowledgeBase",
  {
    knowledgeBaseId: z.string().describe("ID de la base de connaissances Vapi"),
    updates: z
      .object({
        name: z.string().optional().describe("Nouveau nom"),
        searchType: z
          .enum(["fulltext", "semantic", "hybrid"])
          .optional()
          .describe("Nouveau type de recherche"),
        topK: z.number().optional().describe("Nouveau nombre de résultats"),
        removeStopWords: z
          .boolean()
          .optional()
          .describe("Nouvelle configuration des mots vides"),
        scoreThreshold: z
          .number()
          .optional()
          .describe("Nouveau seuil de score"),
      })
      .describe("Mises à jour à appliquer"),
  },
  async (args) => {
    try {
      const result = await updateVapiKnowledgeBase(
        args.knowledgeBaseId,
        args.updates
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour supprimer une base de connaissances Vapi
server.tool(
  "deleteVapiKnowledgeBase",
  {
    knowledgeBaseId: z
      .string()
      .describe("ID de la base de connaissances Vapi à supprimer"),
  },
  async (args) => {
    try {
      const result = await deleteVapiKnowledgeBase(args.knowledgeBaseId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// ===== NOUVEAUX OUTILS VAPI FILES =====

// Outil pour lister les fichiers Vapi
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
      const result = await listVapiFiles(args.limit);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour uploader un fichier Vapi
server.tool(
  "uploadVapiFile",
  {
    name: z.string().describe("Nom du fichier"),
    purpose: z.string().optional().describe("Objectif du fichier"),
    fileContent: z.string().describe("Contenu du fichier (base64 ou texte)"),
    mimetype: z.string().optional().describe("Type MIME du fichier"),
  },
  async (args) => {
    try {
      const result = await uploadVapiFile(args);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour récupérer un fichier Vapi
server.tool(
  "getVapiFile",
  {
    fileId: z.string().describe("ID du fichier Vapi"),
  },
  async (args) => {
    try {
      const result = await getVapiFile(args.fileId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour mettre à jour un fichier Vapi
server.tool(
  "updateVapiFile",
  {
    fileId: z.string().describe("ID du fichier Vapi"),
    updates: z
      .object({
        name: z.string().optional().describe("Nouveau nom"),
        purpose: z.string().optional().describe("Nouvel objectif"),
        metadata: z
          .record(z.any())
          .optional()
          .describe("Nouvelles métadonnées"),
      })
      .describe("Mises à jour à appliquer"),
  },
  async (args) => {
    try {
      const result = await updateVapiFile(args.fileId, args.updates);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour supprimer un fichier Vapi
server.tool(
  "deleteVapiFile",
  {
    fileId: z.string().describe("ID du fichier Vapi à supprimer"),
  },
  async (args) => {
    try {
      const result = await deleteVapiFile(args.fileId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// ===== OUTILS ANALYTICS =====

// Outil pour créer des requêtes d'analytics Vapi
server.tool(
  "createVapiAnalyticsQueries",
  {
    queries: z
      .array(
        z.object({
          table: z.string().describe("Table à analyser (ex: call)"),
          name: z.string().describe("Nom de la requête"),
          operations: z
            .array(
              z.object({
                operation: z
                  .string()
                  .describe("Opération (sum, count, avg, etc.)"),
                column: z.string().describe("Colonne à analyser"),
              })
            )
            .describe("Opérations à effectuer"),
          groupBy: z
            .array(z.string())
            .optional()
            .describe("Colonnes de regroupement"),
          timeRange: z
            .object({
              start: z.string().describe("Date de début (ISO 8601)"),
              end: z.string().describe("Date de fin (ISO 8601)"),
              step: z
                .string()
                .optional()
                .describe("Pas de temps (second, minute, hour, day)"),
              timezone: z.string().optional().describe("Fuseau horaire"),
            })
            .optional()
            .describe("Plage de temps pour l'analyse"),
        })
      )
      .describe("Liste des requêtes d'analytics à exécuter"),
  },
  async (args) => {
    try {
      const result = await createVapiAnalyticsQueries(args.queries);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// ===== OUTILS LOGS =====

// Outil pour récupérer les logs Vapi
server.tool(
  "getVapiLogs",
  {
    type: z
      .enum(["API", "Webhook", "Call", "Provider"])
      .optional()
      .describe("Type de log"),
    webhookType: z
      .string()
      .optional()
      .describe("Type de webhook si applicable"),
    assistantId: z.string().optional().describe("ID de l'assistant"),
    phoneNumberId: z.string().optional().describe("ID du numéro de téléphone"),
    customerId: z.string().optional().describe("ID du client"),
    squadId: z.string().optional().describe("ID de l'équipe"),
    callId: z.string().optional().describe("ID de l'appel"),
    page: z.number().optional().describe("Numéro de page (défaut: 1)"),
    limit: z
      .number()
      .optional()
      .describe("Nombre d'éléments par page (défaut: 100)"),
    sortOrder: z
      .enum(["ASC", "DESC"])
      .optional()
      .describe("Ordre de tri (défaut: DESC)"),
    createdAtGt: z.string().optional().describe("Logs créés après cette date"),
    createdAtLt: z.string().optional().describe("Logs créés avant cette date"),
  },
  async (args) => {
    try {
      const result = await getVapiLogs(args);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour supprimer les logs Vapi
server.tool(
  "deleteVapiLogs",
  {
    type: z
      .enum(["API", "Webhook", "Call", "Provider"])
      .optional()
      .describe("Type de log à supprimer"),
    assistantId: z.string().optional().describe("ID de l'assistant"),
    phoneNumberId: z.string().optional().describe("ID du numéro de téléphone"),
    customerId: z.string().optional().describe("ID du client"),
    squadId: z.string().optional().describe("ID de l'équipe"),
    callId: z.string().optional().describe("ID de l'appel"),
  },
  async (args) => {
    try {
      const result = await deleteVapiLogs(args);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// ===== OUTILS WEBHOOKS =====

// Outil pour traiter les messages serveur Vapi (webhook)
server.tool(
  "processVapiServerMessage",
  {
    message: z
      .object({
        type: z
          .enum([
            "assistant-request",
            "conversation-update",
            "end-of-call-report",
            "function-call",
            "hang",
            "speech-update",
            "status-update",
            "tool-calls",
            "transfer-destination-request",
            "user-interrupted",
            "workflow.node.started",
            "workflow.node.finished",
            "workflow.node.failed",
            "workflow.edge.started",
            "workflow.edge.finished",
            "workflow.edge.failed",
            "workflow.started",
          ])
          .describe("Type de message serveur"),
        call: z.any().optional().describe("Informations sur l'appel"),
        assistant: z.any().optional().describe("Informations sur l'assistant"),
        customer: z.any().optional().describe("Informations sur le client"),
        phoneNumber: z
          .any()
          .optional()
          .describe("Informations sur le numéro de téléphone"),
        timestamp: z.string().optional().describe("Timestamp du message"),
        artifact: z.any().optional().describe("Artefacts de l'appel"),
        transcript: z.any().optional().describe("Transcription"),
        toolCalls: z.any().optional().describe("Appels d'outils"),
        functionCall: z.any().optional().describe("Appel de fonction"),
        destination: z.any().optional().describe("Destination de transfert"),
        workflow: z.any().optional().describe("Informations sur le workflow"),
        node: z.any().optional().describe("Nœud du workflow"),
        edge: z.any().optional().describe("Arête du workflow"),
      })
      .describe("Message serveur reçu de Vapi"),
    serverUrl: z
      .string()
      .optional()
      .describe("URL du serveur qui traite le message"),
  },
  async (args) => {
    try {
      const result = await processVapiServerMessage(
        args.message,
        args.serverUrl
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour traiter les messages client Vapi (webhook)
server.tool(
  "processVapiClientMessage",
  {
    message: z
      .object({
        type: z
          .enum([
            "conversation-update",
            "function-call",
            "hang",
            "model-output",
            "speech-update",
            "status-update",
            "transfer-update",
            "transcript",
            "tool-calls",
            "user-interrupted",
            "voice-input",
            "workflow.node.started",
            "workflow.node.finished",
          ])
          .describe("Type de message client"),
        call: z.any().optional().describe("Informations sur l'appel"),
        assistant: z.any().optional().describe("Informations sur l'assistant"),
        customer: z.any().optional().describe("Informations sur le client"),
        phoneNumber: z
          .any()
          .optional()
          .describe("Informations sur le numéro de téléphone"),
        timestamp: z.string().optional().describe("Timestamp du message"),
        transcript: z.any().optional().describe("Transcription"),
        toolCalls: z.any().optional().describe("Appels d'outils"),
        functionCall: z.any().optional().describe("Appel de fonction"),
        modelOutput: z.any().optional().describe("Sortie du modèle"),
        speechUpdate: z.any().optional().describe("Mise à jour de la parole"),
        statusUpdate: z.any().optional().describe("Mise à jour du statut"),
        transferUpdate: z.any().optional().describe("Mise à jour de transfert"),
        voiceInput: z.any().optional().describe("Entrée vocale"),
        workflow: z.any().optional().describe("Informations sur le workflow"),
        node: z.any().optional().describe("Nœud du workflow"),
      })
      .describe("Message client reçu de Vapi"),
    clientUrl: z
      .string()
      .optional()
      .describe("URL du client qui traite le message"),
  },
  async (args) => {
    try {
      const result = await processVapiClientMessage(
        args.message,
        args.clientUrl
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// ===== NOUVEAUX OUTILS VAPI SQUADS =====

// Outil pour lister les squads Vapi
server.tool(
  "listVapiSquads",
  {
    limit: z
      .number()
      .optional()
      .describe("Nombre maximum de squads à retourner"),
  },
  async (args) => {
    try {
      const result = await listVapiSquads(args.limit);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour créer un squad Vapi
server.tool(
  "createVapiSquad",
  {
    name: z.string().optional().describe("Nom du squad"),
    members: z
      .array(
        z.object({
          assistantId: z.string().describe("ID de l'assistant membre"),
          assistantOverrides: z
            .object({
              firstMessage: z.string().optional(),
              voice: z
                .object({
                  provider: z.string(),
                  voiceId: z.string(),
                })
                .optional(),
              model: z
                .object({
                  provider: z.string(),
                  model: z.string(),
                })
                .optional(),
            })
            .optional()
            .describe("Surcharges pour cet assistant"),
          assistantDestinations: z
            .array(
              z.object({
                assistantName: z
                  .string()
                  .describe("Nom de l'assistant de destination"),
              })
            )
            .optional()
            .describe("Destinations possibles pour cet assistant"),
        })
      )
      .describe("Liste des assistants membres du squad"),
    membersOverrides: z
      .object({
        voice: z
          .object({
            provider: z.string(),
            voiceId: z.string(),
          })
          .optional(),
        firstMessage: z.string().optional(),
        model: z
          .object({
            provider: z.string(),
            model: z.string(),
          })
          .optional(),
        silenceTimeoutSeconds: z.number().optional(),
        maxDurationSeconds: z.number().optional(),
      })
      .optional()
      .describe("Surcharges globales pour tous les membres"),
  },
  async (args) => {
    try {
      const result = await createVapiSquad(args);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour récupérer un squad Vapi
server.tool(
  "getVapiSquad",
  {
    squadId: z.string().describe("ID du squad Vapi à récupérer"),
  },
  async (args) => {
    try {
      const result = await getVapiSquad(args.squadId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour mettre à jour un squad Vapi
server.tool(
  "updateVapiSquad",
  {
    squadId: z.string().describe("ID du squad Vapi à mettre à jour"),
    name: z.string().optional().describe("Nouveau nom du squad"),
    members: z
      .array(
        z.object({
          assistantId: z.string().describe("ID de l'assistant membre"),
          assistantOverrides: z
            .object({
              firstMessage: z.string().optional(),
              voice: z
                .object({
                  provider: z.string(),
                  voiceId: z.string(),
                })
                .optional(),
            })
            .optional(),
        })
      )
      .optional()
      .describe("Nouvelle liste des assistants membres"),
    membersOverrides: z
      .object({
        voice: z
          .object({
            provider: z.string(),
            voiceId: z.string(),
          })
          .optional(),
        firstMessage: z.string().optional(),
        silenceTimeoutSeconds: z.number().optional(),
        maxDurationSeconds: z.number().optional(),
      })
      .optional()
      .describe("Nouvelles surcharges globales"),
  },
  async (args) => {
    try {
      const { squadId, ...updates } = args;
      const result = await updateVapiSquad(squadId, updates);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour supprimer un squad Vapi
server.tool(
  "deleteVapiSquad",
  {
    squadId: z.string().describe("ID du squad Vapi à supprimer"),
  },
  async (args) => {
    try {
      const result = await deleteVapiSquad(args.squadId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// ===== OUTILS VAPI WORKFLOWS =====

// Outil pour lister les workflows Vapi
server.tool(
  "listVapiWorkflows",
  {
    limit: z
      .number()
      .optional()
      .describe("Nombre maximum de workflows à récupérer (défaut: 100)"),
  },
  async (args) => {
    try {
      const workflows = await listVapiWorkflows(args.limit || 100);
      return {
        content: [{ type: "text", text: JSON.stringify(workflows, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour créer un workflow Vapi
server.tool(
  "createVapiWorkflow",
  {
    name: z.string().describe("Nom du workflow (max 80 caractères)"),
    nodes: z
      .array(
        z.object({
          type: z
            .enum(["conversation", "say", "gather", "hangup"])
            .describe("Type de nœud"),
          name: z.string().describe("Nom du nœud"),
          isStart: z
            .boolean()
            .optional()
            .describe("Indique si c'est le nœud de départ"),
          prompt: z
            .string()
            .optional()
            .describe("Prompt pour les nœuds de conversation"),
          voice: z
            .object({
              provider: z.string().describe("Fournisseur de voix"),
              voiceId: z.string().describe("ID de la voix"),
              cachingEnabled: z.boolean().optional().describe("Cache activé"),
            })
            .optional()
            .describe("Configuration de la voix"),
          model: z
            .object({
              provider: z.string().describe("Fournisseur du modèle"),
              model: z.string().describe("Nom du modèle"),
              maxTokens: z
                .number()
                .optional()
                .describe("Nombre maximum de tokens"),
              temperature: z
                .number()
                .optional()
                .describe("Température du modèle"),
            })
            .optional()
            .describe("Configuration du modèle LLM"),
        })
      )
      .describe("Liste des nœuds du workflow"),
    edges: z
      .array(
        z.object({
          from: z.string().describe("Nœud source"),
          to: z.string().describe("Nœud destination"),
          condition: z
            .object({
              type: z.string().describe("Type de condition"),
              prompt: z
                .string()
                .optional()
                .describe("Prompt pour les conditions AI"),
            })
            .optional()
            .describe("Condition pour cette transition"),
        })
      )
      .describe("Liste des arêtes (connexions entre nœuds)"),
    model: z
      .object({
        provider: z.string().describe("Fournisseur du modèle"),
        model: z.string().describe("Nom du modèle"),
        maxTokens: z.number().optional().describe("Nombre maximum de tokens"),
        temperature: z.number().optional().describe("Température du modèle"),
      })
      .optional()
      .describe("Configuration globale du modèle LLM"),
  },
  async (args) => {
    try {
      const workflow = await createVapiWorkflow(args);
      return {
        content: [{ type: "text", text: JSON.stringify(workflow, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour récupérer un workflow Vapi
server.tool(
  "getVapiWorkflow",
  {
    workflowId: z.string().describe("ID du workflow Vapi à récupérer"),
  },
  async (args) => {
    try {
      const workflow = await getVapiWorkflow(args.workflowId);
      return {
        content: [{ type: "text", text: JSON.stringify(workflow, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour mettre à jour un workflow Vapi
server.tool(
  "updateVapiWorkflow",
  {
    workflowId: z.string().describe("ID du workflow Vapi à mettre à jour"),
    updates: z
      .object({
        name: z.string().optional().describe("Nouveau nom du workflow"),
        nodes: z
          .array(z.any())
          .optional()
          .describe("Nouveaux nœuds du workflow"),
        edges: z
          .array(z.any())
          .optional()
          .describe("Nouvelles arêtes du workflow"),
        model: z
          .object({
            provider: z.string().optional(),
            model: z.string().optional(),
            maxTokens: z.number().optional(),
            temperature: z.number().optional(),
          })
          .optional()
          .describe("Nouvelle configuration du modèle"),
      })
      .describe("Mises à jour à appliquer au workflow"),
  },
  async (args) => {
    try {
      const workflow = await updateVapiWorkflow(args.workflowId, args.updates);
      return {
        content: [{ type: "text", text: JSON.stringify(workflow, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour supprimer un workflow Vapi
server.tool(
  "deleteVapiWorkflow",
  {
    workflowId: z.string().describe("ID du workflow Vapi à supprimer"),
  },
  async (args) => {
    try {
      const result = await deleteVapiWorkflow(args.workflowId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// ===== OUTILS VAPI TEST SUITES =====

// Outil pour lister les test suites Vapi
server.tool(
  "listVapiTestSuites",
  {
    limit: z
      .number()
      .optional()
      .describe("Nombre maximum de test suites à récupérer (défaut: 100)"),
    page: z.number().optional().describe("Numéro de page (défaut: 1)"),
    sortOrder: z
      .enum(["ASC", "DESC"])
      .optional()
      .describe("Ordre de tri (défaut: DESC)"),
  },
  async (args) => {
    try {
      const testSuites = await listVapiTestSuites(args);
      return {
        content: [{ type: "text", text: JSON.stringify(testSuites, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour créer une test suite Vapi
server.tool(
  "createVapiTestSuite",
  {
    name: z.string().describe("Nom de la test suite (max 80 caractères)"),
    testerPlan: z
      .object({
        assistant: z
          .object({
            transcriber: z
              .object({
                provider: z.string().describe("Fournisseur de transcription"),
                confidenceThreshold: z
                  .number()
                  .optional()
                  .describe("Seuil de confiance"),
              })
              .optional(),
            model: z
              .object({
                provider: z.string().describe("Fournisseur du modèle"),
                model: z.string().describe("Nom du modèle"),
                maxTokens: z
                  .number()
                  .optional()
                  .describe("Nombre maximum de tokens"),
                temperature: z
                  .number()
                  .optional()
                  .describe("Température du modèle"),
              })
              .optional(),
            voice: z
              .object({
                provider: z.string().describe("Fournisseur de voix"),
                voiceId: z.string().describe("ID de la voix"),
                cachingEnabled: z.boolean().optional().describe("Cache activé"),
              })
              .optional(),
            firstMessage: z
              .string()
              .optional()
              .describe("Premier message de l'assistant"),
            firstMessageMode: z
              .enum(["assistant-speaks-first", "user-speaks-first"])
              .optional()
              .describe("Mode du premier message"),
            silenceTimeoutSeconds: z
              .number()
              .optional()
              .describe("Timeout de silence en secondes"),
            maxDurationSeconds: z
              .number()
              .optional()
              .describe("Durée maximale en secondes"),
          })
          .optional(),
        assistantId: z
          .string()
          .optional()
          .describe("ID d'un assistant existant à utiliser"),
        assistantOverrides: z
          .object({
            transcriber: z.any().optional(),
            model: z.any().optional(),
            voice: z.any().optional(),
            firstMessage: z.string().optional(),
          })
          .optional()
          .describe("Surcharges pour l'assistant"),
      })
      .optional()
      .describe("Configuration de l'agent testeur"),
    targetPlan: z
      .object({
        phoneNumberId: z
          .string()
          .optional()
          .describe("ID du numéro de téléphone à tester"),
        phoneNumber: z
          .object({
            provider: z.string().describe("Fournisseur du numéro"),
            number: z.string().describe("Numéro de téléphone"),
          })
          .optional()
          .describe("Numéro de téléphone à tester"),
        assistantId: z
          .string()
          .optional()
          .describe("ID de l'assistant à tester"),
        assistantOverrides: z
          .object({
            transcriber: z.any().optional(),
            model: z.any().optional(),
            voice: z.any().optional(),
            firstMessage: z.string().optional(),
          })
          .optional()
          .describe("Surcharges pour l'assistant testé"),
      })
      .optional()
      .describe("Configuration de l'assistant/numéro testé"),
  },
  async (args) => {
    try {
      const testSuite = await createVapiTestSuite(args);
      return {
        content: [{ type: "text", text: JSON.stringify(testSuite, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour récupérer une test suite Vapi
server.tool(
  "getVapiTestSuite",
  {
    testSuiteId: z.string().describe("ID de la test suite Vapi à récupérer"),
  },
  async (args) => {
    try {
      const testSuite = await getVapiTestSuite(args.testSuiteId);
      return {
        content: [{ type: "text", text: JSON.stringify(testSuite, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour mettre à jour une test suite Vapi
server.tool(
  "updateVapiTestSuite",
  {
    testSuiteId: z
      .string()
      .describe("ID de la test suite Vapi à mettre à jour"),
    updates: z
      .object({
        name: z.string().optional().describe("Nouveau nom de la test suite"),
        testerPlan: z
          .object({
            assistant: z.any().optional(),
            assistantId: z.string().optional(),
            assistantOverrides: z.any().optional(),
          })
          .optional()
          .describe("Nouvelle configuration de l'agent testeur"),
        targetPlan: z
          .object({
            phoneNumberId: z.string().optional(),
            phoneNumber: z.any().optional(),
            assistantId: z.string().optional(),
            assistantOverrides: z.any().optional(),
          })
          .optional()
          .describe("Nouvelle configuration de l'assistant/numéro testé"),
      })
      .describe("Mises à jour à appliquer à la test suite"),
  },
  async (args) => {
    try {
      const testSuite = await updateVapiTestSuite(
        args.testSuiteId,
        args.updates
      );
      return {
        content: [{ type: "text", text: JSON.stringify(testSuite, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour supprimer une test suite Vapi
server.tool(
  "deleteVapiTestSuite",
  {
    testSuiteId: z.string().describe("ID de la test suite Vapi à supprimer"),
  },
  async (args) => {
    try {
      const result = await deleteVapiTestSuite(args.testSuiteId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// ===== OUTILS VAPI TEST SUITE TESTS =====

// Outil pour lister les tests d'une test suite Vapi
server.tool(
  "listVapiTestSuiteTests",
  {
    testSuiteId: z.string().describe("ID de la test suite Vapi"),
    limit: z
      .number()
      .optional()
      .describe("Nombre maximum de tests à récupérer (défaut: 100)"),
    page: z.number().optional().describe("Numéro de page (défaut: 1)"),
    sortOrder: z
      .enum(["ASC", "DESC"])
      .optional()
      .describe("Ordre de tri (défaut: DESC)"),
  },
  async (args) => {
    try {
      const tests = await listVapiTestSuiteTests(args);
      return {
        content: [{ type: "text", text: JSON.stringify(tests, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour créer un test dans une test suite Vapi
server.tool(
  "createVapiTestSuiteTest",
  {
    testSuiteId: z.string().describe("ID de la test suite Vapi"),
    type: z.enum(["voice", "chat"]).describe("Type de test (voice ou chat)"),
    script: z.string().describe("Script que l'agent testeur doit suivre"),
    scorers: z
      .array(
        z.object({
          type: z.literal("ai").describe("Type de scorer (toujours 'ai')"),
          rubric: z.string().describe("Critères d'évaluation pour ce scorer"),
        })
      )
      .describe("Liste des scorers pour évaluer le test"),
    name: z.string().optional().describe("Nom du test (max 80 caractères)"),
    numAttempts: z
      .number()
      .optional()
      .describe("Nombre de tentatives pour ce test (défaut: 1)"),
  },
  async (args) => {
    try {
      const test = await createVapiTestSuiteTest(args);
      return {
        content: [{ type: "text", text: JSON.stringify(test, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour récupérer un test d'une test suite Vapi
server.tool(
  "getVapiTestSuiteTest",
  {
    testSuiteId: z.string().describe("ID de la test suite Vapi"),
    testId: z.string().describe("ID du test à récupérer"),
  },
  async (args) => {
    try {
      const test = await getVapiTestSuiteTest(args.testSuiteId, args.testId);
      return {
        content: [{ type: "text", text: JSON.stringify(test, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour mettre à jour un test d'une test suite Vapi
server.tool(
  "updateVapiTestSuiteTest",
  {
    testSuiteId: z.string().describe("ID de la test suite Vapi"),
    testId: z.string().describe("ID du test à mettre à jour"),
    updates: z
      .object({
        script: z.string().optional().describe("Nouveau script"),
        scorers: z
          .array(
            z.object({
              type: z.literal("ai"),
              rubric: z.string(),
            })
          )
          .optional()
          .describe("Nouveaux scorers"),
        name: z.string().optional().describe("Nouveau nom du test"),
        numAttempts: z
          .number()
          .optional()
          .describe("Nouveau nombre de tentatives"),
      })
      .describe("Mises à jour à appliquer au test"),
  },
  async (args) => {
    try {
      const test = await updateVapiTestSuiteTest(
        args.testSuiteId,
        args.testId,
        args.updates
      );
      return {
        content: [{ type: "text", text: JSON.stringify(test, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour supprimer un test d'une test suite Vapi
server.tool(
  "deleteVapiTestSuiteTest",
  {
    testSuiteId: z.string().describe("ID de la test suite Vapi"),
    testId: z.string().describe("ID du test à supprimer"),
  },
  async (args) => {
    try {
      const result = await deleteVapiTestSuiteTest(
        args.testSuiteId,
        args.testId
      );
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// ===== OUTILS VAPI TEST SUITE RUNS =====

// Outil pour lister les exécutions de test suites Vapi
server.tool(
  "listVapiTestSuiteRuns",
  {
    testSuiteId: z.string().describe("ID de la test suite Vapi"),
    limit: z
      .number()
      .optional()
      .describe("Nombre maximum d'exécutions à récupérer (défaut: 100)"),
    page: z.number().optional().describe("Numéro de page (défaut: 1)"),
    sortOrder: z
      .enum(["ASC", "DESC"])
      .optional()
      .describe("Ordre de tri (défaut: DESC)"),
  },
  async (args) => {
    try {
      const runs = await listVapiTestSuiteRuns(args);
      return {
        content: [{ type: "text", text: JSON.stringify(runs, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour créer/démarrer une exécution de test suite Vapi
server.tool(
  "createVapiTestSuiteRun",
  {
    testSuiteId: z.string().describe("ID de la test suite Vapi à exécuter"),
    name: z.string().optional().describe("Nom de l'exécution (optionnel)"),
  },
  async (args) => {
    try {
      const run = await createVapiTestSuiteRun(args);
      return {
        content: [{ type: "text", text: JSON.stringify(run, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour récupérer une exécution de test suite Vapi
server.tool(
  "getVapiTestSuiteRun",
  {
    testSuiteId: z.string().describe("ID de la test suite Vapi"),
    runId: z.string().describe("ID de l'exécution à récupérer"),
  },
  async (args) => {
    try {
      const run = await getVapiTestSuiteRun(args.testSuiteId, args.runId);
      return {
        content: [{ type: "text", text: JSON.stringify(run, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour mettre à jour une exécution de test suite Vapi
server.tool(
  "updateVapiTestSuiteRun",
  {
    testSuiteId: z.string().describe("ID de la test suite Vapi"),
    runId: z.string().describe("ID de l'exécution à mettre à jour"),
    updates: z
      .object({
        name: z.string().optional().describe("Nouveau nom de l'exécution"),
        status: z
          .enum(["pending", "running", "completed", "failed", "cancelled"])
          .optional()
          .describe("Nouveau statut de l'exécution"),
      })
      .describe("Mises à jour à appliquer à l'exécution"),
  },
  async (args) => {
    try {
      const run = await updateVapiTestSuiteRun(
        args.testSuiteId,
        args.runId,
        args.updates
      );
      return {
        content: [{ type: "text", text: JSON.stringify(run, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Outil pour supprimer une exécution de test suite Vapi
server.tool(
  "deleteVapiTestSuiteRun",
  {
    testSuiteId: z.string().describe("ID de la test suite Vapi"),
    runId: z.string().describe("ID de l'exécution à supprimer"),
  },
  async (args) => {
    try {
      const result = await deleteVapiTestSuiteRun(args.testSuiteId, args.runId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Erreur: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// ===== FONCTIONS D'IMPLÉMENTATION WORKFLOWS =====

/**
 * Liste tous les workflows depuis Vapi
 */
async function listVapiWorkflows(limit = 100) {
  const response = await fetch(`https://api.vapi.ai/workflow?limit=${limit}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Crée un nouveau workflow sur Vapi
 */
async function createVapiWorkflow(workflowData) {
  const response = await fetch("https://api.vapi.ai/workflow", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(workflowData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Récupère un workflow spécifique depuis Vapi
 */
async function getVapiWorkflow(workflowId) {
  const response = await fetch(`https://api.vapi.ai/workflow/${workflowId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Met à jour un workflow existant sur Vapi
 */
async function updateVapiWorkflow(workflowId, updates) {
  const response = await fetch(`https://api.vapi.ai/workflow/${workflowId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Supprime un workflow sur Vapi
 */
async function deleteVapiWorkflow(workflowId) {
  const response = await fetch(`https://api.vapi.ai/workflow/${workflowId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  // DELETE peut retourner un statut 204 (No Content)
  if (response.status === 204) {
    return { success: true, message: "Workflow supprimé avec succès" };
  }

  return await response.json();
}

// ===== FONCTIONS D'IMPLÉMENTATION CALLS =====

/**
 * Liste tous les appels depuis Vapi
 */
async function listVapiCalls(limit = 100) {
  const params = new URLSearchParams({
    limit: limit.toString(),
  });

  const response = await fetch(`https://api.vapi.ai/call?${params}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Crée un nouvel appel sur Vapi
 */
async function createVapiCall(callData) {
  const response = await fetch("https://api.vapi.ai/call", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(callData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Récupère un appel spécifique depuis Vapi
 */
async function getVapiCall(callId) {
  const response = await fetch(`https://api.vapi.ai/call/${callId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Met à jour un appel existant sur Vapi
 */
async function updateVapiCall(callId, updates) {
  const response = await fetch(`https://api.vapi.ai/call/${callId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Supprime un appel sur Vapi
 */
async function deleteVapiCall(callId) {
  const response = await fetch(`https://api.vapi.ai/call/${callId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  // DELETE peut retourner un statut 204 (No Content)
  if (response.status === 204) {
    return { success: true, message: "Appel supprimé avec succès" };
  }

  return await response.json();
}

/**
 * Raccroche un appel en cours sur Vapi
 */
async function hangupVapiCall(callId) {
  const response = await fetch(`https://api.vapi.ai/call/${callId}/hangup`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Exécute une fonction sur un appel Vapi
 */
async function functionCallVapi(callId, functionCall) {
  const response = await fetch(
    `https://api.vapi.ai/call/${callId}/function-call`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(functionCall),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Fait parler l'assistant sur un appel Vapi
 */
async function sayVapiCall(callId, message) {
  const response = await fetch(`https://api.vapi.ai/call/${callId}/say`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  return await response.json();
}

// ===== FONCTIONS D'IMPLÉMENTATION PHONE NUMBERS =====

/**
 * Liste tous les numéros de téléphone depuis Vapi
 */
async function listVapiPhoneNumbers(limit = 100) {
  const params = new URLSearchParams({
    limit: limit.toString(),
  });

  const response = await fetch(`https://api.vapi.ai/phone-number?${params}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Achète un nouveau numéro de téléphone sur Vapi
 */
async function buyVapiPhoneNumber(phoneNumberData) {
  const response = await fetch("https://api.vapi.ai/phone-number", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(phoneNumberData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Récupère un numéro de téléphone spécifique depuis Vapi
 */
async function getVapiPhoneNumber(phoneNumberId) {
  const response = await fetch(
    `https://api.vapi.ai/phone-number/${phoneNumberId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Met à jour un numéro de téléphone existant sur Vapi
 */
async function updateVapiPhoneNumber(phoneNumberId, updates) {
  const response = await fetch(
    `https://api.vapi.ai/phone-number/${phoneNumberId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Supprime un numéro de téléphone sur Vapi
 */
async function deleteVapiPhoneNumber(phoneNumberId) {
  const response = await fetch(
    `https://api.vapi.ai/phone-number/${phoneNumberId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  // DELETE peut retourner un statut 204 (No Content)
  if (response.status === 204) {
    return {
      success: true,
      message: "Numéro de téléphone supprimé avec succès",
    };
  }

  return await response.json();
}

// ===== FONCTIONS D'IMPLÉMENTATION FILES =====

/**
 * Liste tous les fichiers depuis Vapi
 */
async function listVapiFiles(limit = 100) {
  const params = new URLSearchParams({
    limit: limit.toString(),
  });

  const response = await fetch(`https://api.vapi.ai/file?${params}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Upload un nouveau fichier sur Vapi
 */
async function uploadVapiFile(fileData) {
  const response = await fetch("https://api.vapi.ai/file", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fileData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Récupère un fichier spécifique depuis Vapi
 */
async function getVapiFile(fileId) {
  const response = await fetch(`https://api.vapi.ai/file/${fileId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Met à jour un fichier existant sur Vapi
 */
async function updateVapiFile(fileId, updates) {
  const response = await fetch(`https://api.vapi.ai/file/${fileId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Supprime un fichier sur Vapi
 */
async function deleteVapiFile(fileId) {
  const response = await fetch(`https://api.vapi.ai/file/${fileId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  // DELETE peut retourner un statut 204 (No Content)
  if (response.status === 204) {
    return { success: true, message: "Fichier supprimé avec succès" };
  }

  return await response.json();
}

// ===== FONCTIONS D'IMPLÉMENTATION ANALYTICS =====

/**
 * Crée des requêtes d'analytics sur Vapi
 */
async function createVapiAnalyticsQueries(queries) {
  const response = await fetch("https://api.vapi.ai/analytics", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ queries }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  return await response.json();
}

// ===== FONCTIONS D'IMPLÉMENTATION LOGS =====

/**
 * Récupère les logs depuis Vapi
 */
async function getVapiLogs(options = {}) {
  const params = new URLSearchParams();

  // Ajouter les paramètres optionnels
  if (options.type) params.append("type", options.type);
  if (options.webhookType) params.append("webhookType", options.webhookType);
  if (options.assistantId) params.append("assistantId", options.assistantId);
  if (options.phoneNumberId)
    params.append("phoneNumberId", options.phoneNumberId);
  if (options.customerId) params.append("customerId", options.customerId);
  if (options.squadId) params.append("squadId", options.squadId);
  if (options.callId) params.append("callId", options.callId);
  if (options.page) params.append("page", options.page.toString());
  if (options.limit) params.append("limit", options.limit.toString());
  if (options.sortOrder) params.append("sortOrder", options.sortOrder);
  if (options.createdAtGt) params.append("createdAtGt", options.createdAtGt);
  if (options.createdAtLt) params.append("createdAtLt", options.createdAtLt);

  const response = await fetch(`https://api.vapi.ai/logs?${params}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Supprime les logs depuis Vapi
 */
async function deleteVapiLogs(options = {}) {
  const params = new URLSearchParams();

  // Ajouter les paramètres optionnels
  if (options.type) params.append("type", options.type);
  if (options.assistantId) params.append("assistantId", options.assistantId);
  if (options.phoneNumberId)
    params.append("phoneNumberId", options.phoneNumberId);
  if (options.customerId) params.append("customerId", options.customerId);
  if (options.squadId) params.append("squadId", options.squadId);
  if (options.callId) params.append("callId", options.callId);

  const response = await fetch(`https://api.vapi.ai/logs?${params}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  // DELETE peut retourner un statut 204 (No Content)
  if (response.status === 204) {
    return { success: true, message: "Logs supprimés avec succès" };
  }

  return await response.json();
}

// ===== FONCTIONS D'IMPLÉMENTATION WEBHOOKS =====

/**
 * Traite les messages serveur reçus de Vapi via webhook
 */
async function processVapiServerMessage(message, serverUrl) {
  // Cette fonction simule le traitement d'un message serveur webhook
  // Dans un vrai scénario, ceci serait un endpoint qui reçoit les webhooks de Vapi

  const processedMessage = {
    received: true,
    timestamp: new Date().toISOString(),
    messageType: message.type,
    serverUrl: serverUrl || "https://your-server.com/webhook/server",
    processing: {
      status: "processed",
      handledBy: "AlloKoli MCP Server",
    },
    originalMessage: message,
  };

  // Traitement spécifique selon le type de message
  switch (message.type) {
    case "assistant-request":
      processedMessage.response = {
        messageResponse: {
          assistant: {
            firstMessage: "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
            model: {
              provider: "openai",
              model: "gpt-4",
            },
            voice: {
              provider: "11labs",
              voiceId: "burt",
            },
          },
        },
      };
      break;

    case "function-call":
    case "tool-calls":
      processedMessage.response = {
        result: "Function/tool call processed successfully",
        data: message.functionCall || message.toolCalls,
      };
      break;

    case "transfer-destination-request":
      processedMessage.response = {
        destination: {
          type: "number",
          number: "+33123456789",
          message: "Transfert vers le service client",
        },
      };
      break;

    case "end-of-call-report":
      processedMessage.response = {
        callSummary: "Appel traité avec succès",
        duration: message.call?.duration || "N/A",
        status: "completed",
      };
      break;

    default:
      processedMessage.response = {
        acknowledged: true,
        message: `Message de type ${message.type} reçu et traité`,
      };
  }

  return processedMessage;
}

/**
 * Traite les messages client reçus de Vapi via webhook
 */
async function processVapiClientMessage(message, clientUrl) {
  // Cette fonction simule le traitement d'un message client webhook
  // Dans un vrai scénario, ceci serait un endpoint qui reçoit les webhooks de Vapi

  const processedMessage = {
    received: true,
    timestamp: new Date().toISOString(),
    messageType: message.type,
    clientUrl: clientUrl || "https://your-client.com/webhook/client",
    processing: {
      status: "processed",
      handledBy: "AlloKoli MCP Server",
    },
    originalMessage: message,
  };

  // Traitement spécifique selon le type de message
  switch (message.type) {
    case "conversation-update":
      processedMessage.response = {
        message: {
          type: "add-message",
          message: {
            role: "assistant",
            content: "Message de conversation mis à jour",
          },
          triggerResponseEnabled: true,
        },
      };
      break;

    case "function-call":
    case "tool-calls":
      processedMessage.response = {
        message: {
          type: "function-call-result",
          result: "Résultat de l'appel de fonction",
          data: message.functionCall || message.toolCalls,
        },
      };
      break;

    case "transcript":
      processedMessage.response = {
        message: {
          type: "transcript-processed",
          transcript: message.transcript,
          processed: true,
        },
      };
      break;

    case "status-update":
      processedMessage.response = {
        message: {
          type: "status-acknowledged",
          status: message.statusUpdate,
          acknowledged: true,
        },
      };
      break;

    case "workflow.node.started":
    case "workflow.node.finished":
      processedMessage.response = {
        message: {
          type: "workflow-update",
          workflow: message.workflow,
          node: message.node,
          status: message.type,
        },
      };
      break;

    default:
      processedMessage.response = {
        message: {
          type: "acknowledgment",
          content: `Message de type ${message.type} reçu et traité côté client`,
        },
      };
  }

  return processedMessage;
}

// ===== FONCTIONS D'IMPLÉMENTATION TEST SUITES =====

/**
 * Liste toutes les test suites depuis Vapi
 */
async function listVapiTestSuites(options = {}) {
  const { limit = 100, page = 1, sortOrder = "DESC" } = options;

  const params = new URLSearchParams({
    limit: limit.toString(),
    page: page.toString(),
    sortOrder: sortOrder,
  });

  const response = await fetch(`https://api.vapi.ai/test-suite?${params}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Crée une nouvelle test suite sur Vapi
 */
async function createVapiTestSuite(testSuiteData) {
  const response = await fetch("https://api.vapi.ai/test-suite", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(testSuiteData),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Récupère une test suite spécifique depuis Vapi
 */
async function getVapiTestSuite(testSuiteId) {
  const response = await fetch(
    `https://api.vapi.ai/test-suite/${testSuiteId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Met à jour une test suite existante sur Vapi
 */
async function updateVapiTestSuite(testSuiteId, updates) {
  const response = await fetch(
    `https://api.vapi.ai/test-suite/${testSuiteId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Supprime une test suite sur Vapi
 */
async function deleteVapiTestSuite(testSuiteId) {
  const response = await fetch(
    `https://api.vapi.ai/test-suite/${testSuiteId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  // DELETE peut retourner un statut 204 (No Content)
  if (response.status === 204) {
    return { success: true, message: "Test suite supprimée avec succès" };
  }

  return await response.json();
}

// ===== FONCTIONS D'IMPLÉMENTATION TEST SUITE TESTS =====

/**
 * Liste tous les tests d'une test suite depuis Vapi
 */
async function listVapiTestSuiteTests(options = {}) {
  const { testSuiteId, limit = 100, page = 1, sortOrder = "DESC" } = options;

  const params = new URLSearchParams({
    limit: limit.toString(),
    page: page.toString(),
    sortOrder: sortOrder,
  });

  const response = await fetch(
    `https://api.vapi.ai/test-suite/${testSuiteId}/test?${params}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Crée un nouveau test dans une test suite sur Vapi
 */
async function createVapiTestSuiteTest(testData) {
  const { testSuiteId, type, script, scorers, name, numAttempts } = testData;

  // Construire le payload selon le type de test
  const payload = {
    [type]: {
      script,
      scorers,
      ...(name && { name }),
      ...(numAttempts && { numAttempts }),
    },
  };

  const response = await fetch(
    `https://api.vapi.ai/test-suite/${testSuiteId}/test`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Récupère un test spécifique d'une test suite depuis Vapi
 */
async function getVapiTestSuiteTest(testSuiteId, testId) {
  const response = await fetch(
    `https://api.vapi.ai/test-suite/${testSuiteId}/test/${testId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Met à jour un test existant dans une test suite sur Vapi
 */
async function updateVapiTestSuiteTest(testSuiteId, testId, updates) {
  const response = await fetch(
    `https://api.vapi.ai/test-suite/${testSuiteId}/test/${testId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Supprime un test d'une test suite sur Vapi
 */
async function deleteVapiTestSuiteTest(testSuiteId, testId) {
  const response = await fetch(
    `https://api.vapi.ai/test-suite/${testSuiteId}/test/${testId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  // DELETE peut retourner un statut 204 (No Content)
  if (response.status === 204) {
    return { success: true, message: "Test supprimé avec succès" };
  }

  return await response.json();
}

// ===== FONCTIONS D'IMPLÉMENTATION TEST SUITE RUNS =====

/**
 * Liste toutes les exécutions d'une test suite depuis Vapi
 */
async function listVapiTestSuiteRuns(options = {}) {
  const { testSuiteId, limit = 100, page = 1, sortOrder = "DESC" } = options;

  const params = new URLSearchParams({
    limit: limit.toString(),
    page: page.toString(),
    sortOrder: sortOrder,
  });

  const response = await fetch(
    `https://api.vapi.ai/test-suite/${testSuiteId}/run?${params}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Crée/démarre une nouvelle exécution de test suite sur Vapi
 */
async function createVapiTestSuiteRun(runData) {
  const { testSuiteId, name } = runData;

  const payload = {
    ...(name && { name }),
  };

  const response = await fetch(
    `https://api.vapi.ai/test-suite/${testSuiteId}/run`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Récupère une exécution spécifique d'une test suite depuis Vapi
 */
async function getVapiTestSuiteRun(testSuiteId, runId) {
  const response = await fetch(
    `https://api.vapi.ai/test-suite/${testSuiteId}/run/${runId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Met à jour une exécution existante d'une test suite sur Vapi
 */
async function updateVapiTestSuiteRun(testSuiteId, runId, updates) {
  const response = await fetch(
    `https://api.vapi.ai/test-suite/${testSuiteId}/run/${runId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  return await response.json();
}

/**
 * Supprime une exécution d'une test suite sur Vapi
 */
async function deleteVapiTestSuiteRun(testSuiteId, runId) {
  const response = await fetch(
    `https://api.vapi.ai/test-suite/${testSuiteId}/run/${runId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
  }

  // DELETE peut retourner un statut 204 (No Content)
  if (response.status === 204) {
    return { success: true, message: "Exécution supprimée avec succès" };
  }

  return await response.json();
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("AlloKoli MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
