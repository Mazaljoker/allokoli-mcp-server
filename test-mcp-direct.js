#!/usr/bin/env node

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger le fichier .env du répertoire parent
dotenv.config({ path: join(__dirname, "..", ".env") });

console.log("🧪 Test direct des fonctions MCP Allokoli");
console.log("========================================");

// Importer les fonctions depuis index.js
import fetch from "node-fetch";

const vapiApiKey = process.env.VAPI_API_KEY;

console.log("✅ VAPI_API_KEY:", vapiApiKey ? "Définie" : "❌ Non définie");

/**
 * Test direct de listVapiAssistants
 */
async function testListVapiAssistants(limit = 5) {
  if (!vapiApiKey) {
    throw new Error("VAPI_API_KEY non configuree");
  }

  console.log(`\n🔍 Test: listVapiAssistants (limit: ${limit})`);

  const response = await fetch(`https://api.vapi.ai/assistant?limit=${limit}`, {
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

  const assistants = await response.json();
  console.log(`✅ ${assistants.length} assistants récupérés`);

  if (assistants.length > 0) {
    console.log("📋 Premier assistant:");
    console.log(`   - ID: ${assistants[0].id}`);
    console.log(`   - Nom: ${assistants[0].name || "Sans nom"}`);
    console.log(`   - Créé: ${assistants[0].createdAt}`);
  }

  return assistants;
}

/**
 * Test direct de getVapiAssistant
 */
async function testGetVapiAssistant(assistantId) {
  if (!vapiApiKey) {
    throw new Error("VAPI_API_KEY non configuree");
  }

  console.log(`\n🔍 Test: getVapiAssistant (ID: ${assistantId})`);

  const response = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
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

  const assistant = await response.json();
  console.log("✅ Assistant récupéré:");
  console.log(`   - Nom: ${assistant.name || "Sans nom"}`);
  console.log(
    `   - Premier message: ${assistant.firstMessage || "Non défini"}`
  );
  console.log(`   - Modèle: ${assistant.model?.model || "Non défini"}`);
  console.log(`   - Voix: ${assistant.voice?.provider || "Non défini"}`);

  return assistant;
}

/**
 * Test direct de listVapiCalls
 */
async function testListVapiCalls(limit = 3) {
  if (!vapiApiKey) {
    throw new Error("VAPI_API_KEY non configuree");
  }

  console.log(`\n🔍 Test: listVapiCalls (limit: ${limit})`);

  const response = await fetch(`https://api.vapi.ai/call?limit=${limit}`, {
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

  const calls = await response.json();
  console.log(`✅ ${calls.length} appels récupérés`);

  if (calls.length > 0) {
    console.log("📞 Dernier appel:");
    console.log(`   - ID: ${calls[0].id}`);
    console.log(`   - Status: ${calls[0].status}`);
    console.log(`   - Type: ${calls[0].type}`);
    console.log(`   - Créé: ${calls[0].createdAt}`);
  }

  return calls;
}

/**
 * Test direct de listVapiPhoneNumbers
 */
async function testListVapiPhoneNumbers(limit = 3) {
  if (!vapiApiKey) {
    throw new Error("VAPI_API_KEY non configuree");
  }

  console.log(`\n🔍 Test: listVapiPhoneNumbers (limit: ${limit})`);

  const response = await fetch(
    `https://api.vapi.ai/phone-number?limit=${limit}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${vapiApiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur Vapi: ${error}`);
  }

  const phoneNumbers = await response.json();
  console.log(`✅ ${phoneNumbers.length} numéros récupérés`);

  if (phoneNumbers.length > 0) {
    console.log("📱 Premier numéro:");
    console.log(
      `   - Numéro: ${
        phoneNumbers[0].number || phoneNumbers[0].twilioPhoneNumber
      }`
    );
    console.log(`   - Nom: ${phoneNumbers[0].name || "Sans nom"}`);
    console.log(
      `   - Provider: ${phoneNumbers[0].twilioAccountSid ? "Twilio" : "Autre"}`
    );
  }

  return phoneNumbers;
}

/**
 * Exécuter tous les tests
 */
async function runAllTests() {
  try {
    console.log("🚀 Démarrage des tests...\n");

    // Test 1: Lister les assistants
    const assistants = await testListVapiAssistants(5);

    // Test 2: Récupérer un assistant spécifique (si disponible)
    if (assistants.length > 0) {
      await testGetVapiAssistant(assistants[0].id);
    }

    // Test 3: Lister les appels
    await testListVapiCalls(3);

    // Test 4: Lister les numéros de téléphone
    await testListVapiPhoneNumbers(3);

    console.log("\n🎉 Tous les tests sont passés avec succès !");
    console.log("\n📊 Résumé:");
    console.log(`   - ${assistants.length} assistants disponibles`);
    console.log("   - API Vapi entièrement fonctionnelle");
    console.log("   - Prêt pour l'implémentation des fonctionnalités avancées");
  } catch (error) {
    console.error("\n❌ Erreur lors des tests:", error.message);
    process.exit(1);
  }
}

runAllTests();
