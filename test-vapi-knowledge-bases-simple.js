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

console.log("🧠 Test simplifié des fonctionnalités Knowledge Bases Vapi");
console.log("=========================================================");

/**
 * Test de listVapiKnowledgeBases
 */
async function testListVapiKnowledgeBases() {
  console.log("\n🔍 Test: listVapiKnowledgeBases");

  const response = await fetch("https://api.vapi.ai/knowledge-base?limit=10", {
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

  const knowledgeBases = await response.json();
  console.log(`✅ ${knowledgeBases.length} bases de connaissances récupérées`);

  if (knowledgeBases.length > 0) {
    console.log("🧠 Première base de connaissances:");
    console.log(`   - ID: ${knowledgeBases[0].id}`);
    console.log(`   - Nom: ${knowledgeBases[0].name || "Sans nom"}`);
    console.log(`   - Provider: ${knowledgeBases[0].provider}`);
    console.log(
      `   - Type de recherche: ${
        knowledgeBases[0].searchPlan?.searchType || "Non défini"
      }`
    );
  }

  return knowledgeBases;
}

/**
 * Test de createVapiKnowledgeBase avec Custom (plus simple)
 */
async function testCreateVapiKnowledgeBaseCustom() {
  console.log("\n🔍 Test: createVapiKnowledgeBase (Custom)");

  const kbConfig = {
    provider: "custom-knowledge-base",
    server: {
      url: "https://api.example.com/search",
      timeoutSeconds: 30,
    },
  };

  const response = await fetch("https://api.vapi.ai/knowledge-base", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${vapiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(kbConfig),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur Vapi: ${error}`);
  }

  const knowledgeBase = await response.json();
  console.log("✅ Base de connaissances Custom créée:");
  console.log(`   - ID: ${knowledgeBase.id}`);
  console.log(`   - Provider: ${knowledgeBase.provider}`);
  console.log(`   - Nom: ${knowledgeBase.name || "Non défini"}`);
  console.log(`   - URL: ${knowledgeBase.server?.url || "Non définie"}`);
  console.log(
    `   - Timeout: ${knowledgeBase.server?.timeoutSeconds || "Non défini"}s`
  );

  return knowledgeBase;
}

/**
 * Test de getVapiKnowledgeBase
 */
async function testGetVapiKnowledgeBase(knowledgeBaseId) {
  console.log(`\n🔍 Test: getVapiKnowledgeBase (ID: ${knowledgeBaseId})`);

  const response = await fetch(
    `https://api.vapi.ai/knowledge-base/${knowledgeBaseId}`,
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

  const knowledgeBase = await response.json();
  console.log("✅ Base de connaissances récupérée:");
  console.log(`   - Nom: ${knowledgeBase.name || "Non défini"}`);
  console.log(`   - Provider: ${knowledgeBase.provider}`);

  if (knowledgeBase.server) {
    console.log(`   - URL serveur: ${knowledgeBase.server.url}`);
    console.log(`   - Timeout: ${knowledgeBase.server.timeoutSeconds}s`);
  }

  return knowledgeBase;
}

/**
 * Test de deleteVapiKnowledgeBase
 */
async function testDeleteVapiKnowledgeBase(knowledgeBaseId) {
  console.log(`\n🔍 Test: deleteVapiKnowledgeBase (ID: ${knowledgeBaseId})`);

  const response = await fetch(
    `https://api.vapi.ai/knowledge-base/${knowledgeBaseId}`,
    {
      method: "DELETE",
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

  console.log("✅ Base de connaissances supprimée avec succès");
  return { success: true };
}

/**
 * Exécuter les tests Knowledge Bases simplifiés
 */
async function runSimpleKnowledgeBasesTests() {
  try {
    console.log("🚀 Démarrage des tests Knowledge Bases simplifiés...\n");

    // Test 1: Lister les bases de connaissances existantes
    const existingKBs = await testListVapiKnowledgeBases();

    // Test 2: Créer une base de connaissances Custom (plus simple)
    const newCustomKB = await testCreateVapiKnowledgeBaseCustom();

    // Test 3: Récupérer la base Custom créée
    await testGetVapiKnowledgeBase(newCustomKB.id);

    // Test 4: Supprimer la base de test
    await testDeleteVapiKnowledgeBase(newCustomKB.id);

    console.log(
      "\n🎉 Tous les tests Knowledge Bases simplifiés sont passés avec succès !"
    );
    console.log("\n📊 Résumé:");
    console.log(`   - ${existingKBs.length} bases de connaissances existantes`);
    console.log("   - Création KB Custom: ✅");
    console.log("   - Récupération KB: ✅");
    console.log("   - Suppression KB: ✅");
    console.log("   - API Knowledge Bases Vapi fonctionnelle (Custom)");
    console.log(
      "\n💡 Note: Les Knowledge Bases Trieve nécessitent une configuration préalable des credentials."
    );
  } catch (error) {
    console.error("\n❌ Erreur lors des tests Knowledge Bases:", error.message);
    process.exit(1);
  }
}

runSimpleKnowledgeBasesTests();
