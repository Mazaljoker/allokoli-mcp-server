#!/usr/bin/env node

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger le fichier .env du répertoire parent
dotenv.config({ path: join(__dirname, "..", ".env") });

const vapiApiKey = process.env.VAPI_API_KEY;

console.log("🔧 Test des fonctionnalités Tools Vapi");
console.log("=====================================");

/**
 * Test de listVapiTools
 */
async function testListVapiTools() {
  console.log("\n🔍 Test: listVapiTools");

  const response = await fetch("https://api.vapi.ai/tool?limit=10", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${vapiApiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur Vapi: ${error}`);
  }

  const tools = await response.json();
  console.log(`✅ ${tools.length} outils récupérés`);

  if (tools.length > 0) {
    console.log("🔧 Premier outil:");
    console.log(`   - ID: ${tools[0].id}`);
    console.log(`   - Nom: ${tools[0].name || "Sans nom"}`);
    console.log(`   - Type: ${tools[0].type}`);
    console.log(`   - URL: ${tools[0].url || "Non définie"}`);
  }

  return tools;
}

/**
 * Test de createVapiTool
 */
async function testCreateVapiTool() {
  console.log("\n🔍 Test: createVapiTool");

  const toolConfig = {
    type: "function",
    function: {
      name: "get_weather",
      description: "Outil de test pour récupérer la météo",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "La ville pour laquelle récupérer la météo",
          },
        },
        required: ["location"],
      },
    },
    server: {
      url: "https://api.openweathermap.org/data/2.5/weather",
      timeoutSeconds: 30,
    },
    async: false,
  };

  const response = await fetch("https://api.vapi.ai/tool", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${vapiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(toolConfig),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur Vapi: ${error}`);
  }

  const tool = await response.json();
  console.log("✅ Outil créé avec succès:");
  console.log(`   - ID: ${tool.id}`);
  console.log(`   - Type: ${tool.type}`);
  console.log(`   - Nom: ${tool.function?.name || "Non défini"}`);
  console.log(`   - URL: ${tool.server?.url || "Non définie"}`);

  return tool;
}

/**
 * Test de getVapiTool
 */
async function testGetVapiTool(toolId) {
  console.log(`\n🔍 Test: getVapiTool (ID: ${toolId})`);

  const response = await fetch(`https://api.vapi.ai/tool/${toolId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${vapiApiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur Vapi: ${error}`);
  }

  const tool = await response.json();
  console.log("✅ Outil récupéré:");
  console.log(`   - Nom: ${tool.function?.name || "Non défini"}`);
  console.log(
    `   - Description: ${tool.function?.description || "Non définie"}`
  );
  console.log(`   - Type: ${tool.type}`);
  console.log(`   - Timeout: ${tool.server?.timeoutSeconds || "Non défini"}s`);

  return tool;
}

/**
 * Test de updateVapiTool
 */
async function testUpdateVapiTool(toolId) {
  console.log(`\n🔍 Test: updateVapiTool (ID: ${toolId})`);

  const updates = {
    server: {
      timeoutSeconds: 45,
    },
  };

  const response = await fetch(`https://api.vapi.ai/tool/${toolId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${vapiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur Vapi: ${error}`);
  }

  const tool = await response.json();
  console.log("✅ Outil mis à jour:");
  console.log(
    `   - Description: ${tool.function?.description || "Non définie"}`
  );
  console.log(`   - Timeout: ${tool.server?.timeoutSeconds || "Non défini"}s`);

  return tool;
}

/**
 * Test de deleteVapiTool
 */
async function testDeleteVapiTool(toolId) {
  console.log(`\n🔍 Test: deleteVapiTool (ID: ${toolId})`);

  const response = await fetch(`https://api.vapi.ai/tool/${toolId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${vapiApiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur Vapi: ${error}`);
  }

  console.log("✅ Outil supprimé avec succès");
  return { success: true };
}

/**
 * Exécuter tous les tests Tools
 */
async function runToolsTests() {
  try {
    console.log("🚀 Démarrage des tests Tools...\n");

    // Test 1: Lister les outils existants
    const existingTools = await testListVapiTools();

    // Test 2: Créer un nouvel outil
    const newTool = await testCreateVapiTool();

    // Test 3: Récupérer l'outil créé
    await testGetVapiTool(newTool.id);

    // Test 4: Mettre à jour l'outil
    await testUpdateVapiTool(newTool.id);

    // Test 5: Supprimer l'outil de test
    await testDeleteVapiTool(newTool.id);

    console.log("\n🎉 Tous les tests Tools sont passés avec succès !");
    console.log("\n📊 Résumé:");
    console.log(`   - ${existingTools.length} outils existants`);
    console.log("   - Création d'outil: ✅");
    console.log("   - Récupération d'outil: ✅");
    console.log("   - Mise à jour d'outil: ✅");
    console.log("   - Suppression d'outil: ✅");
    console.log("   - API Tools Vapi entièrement fonctionnelle");
  } catch (error) {
    console.error("\n❌ Erreur lors des tests Tools:", error.message);
    process.exit(1);
  }
}

runToolsTests();
