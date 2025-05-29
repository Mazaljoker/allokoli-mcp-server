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

console.log("🧠 Test des fonctionnalités Knowledge Bases Vapi");
console.log("===============================================");

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
 * Test de createVapiKnowledgeBase avec Trieve
 */
async function testCreateVapiKnowledgeBaseTrieve() {
  console.log("\n🔍 Test: createVapiKnowledgeBase (Trieve)");

  const kbConfig = {
    provider: "trieve",
    name: "KB Test Allokoli - Trieve",
    createPlan: {
      type: "import",
      providerId: "demo-dataset-id-12345", // ID fictif pour le test
    },
    searchPlan: {
      searchType: "semantic",
      topK: 5,
      removeStopWords: true,
      scoreThreshold: 0.7,
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
  console.log("✅ Base de connaissances Trieve créée:");
  console.log(`   - ID: ${knowledgeBase.id}`);
  console.log(`   - Provider: ${knowledgeBase.provider}`);
  console.log(`   - Nom: ${knowledgeBase.name || "Non défini"}`);
  console.log(
    `   - Type de recherche: ${
      knowledgeBase.searchPlan?.searchType || "Non défini"
    }`
  );
  console.log(`   - TopK: ${knowledgeBase.searchPlan?.topK || "Non défini"}`);

  return knowledgeBase;
}

/**
 * Test de createVapiKnowledgeBase avec Custom
 */
async function testCreateVapiKnowledgeBaseCustom() {
  console.log("\n🔍 Test: createVapiKnowledgeBase (Custom)");

  const kbConfig = {
    provider: "custom-knowledge-base",
    name: "KB Test Allokoli - Custom",
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

  if (knowledgeBase.searchPlan) {
    console.log(
      `   - Type de recherche: ${knowledgeBase.searchPlan.searchType}`
    );
    console.log(`   - TopK: ${knowledgeBase.searchPlan.topK}`);
    console.log(
      `   - Seuil de score: ${knowledgeBase.searchPlan.scoreThreshold}`
    );
  }

  if (knowledgeBase.server) {
    console.log(`   - URL serveur: ${knowledgeBase.server.url}`);
    console.log(`   - Timeout: ${knowledgeBase.server.timeoutSeconds}s`);
  }

  return knowledgeBase;
}

/**
 * Test de updateVapiKnowledgeBase
 */
async function testUpdateVapiKnowledgeBase(knowledgeBaseId) {
  console.log(`\n🔍 Test: updateVapiKnowledgeBase (ID: ${knowledgeBaseId})`);

  const updates = {
    name: "KB Test Allokoli - Mise à jour",
    searchPlan: {
      topK: 10,
      scoreThreshold: 0.8,
    },
  };

  const response = await fetch(
    `https://api.vapi.ai/knowledge-base/${knowledgeBaseId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${vapiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur Vapi: ${error}`);
  }

  const knowledgeBase = await response.json();
  console.log("✅ Base de connaissances mise à jour:");
  console.log(`   - Nom: ${knowledgeBase.name || "Non défini"}`);
  console.log(`   - TopK: ${knowledgeBase.searchPlan?.topK || "Non défini"}`);
  console.log(
    `   - Seuil: ${knowledgeBase.searchPlan?.scoreThreshold || "Non défini"}`
  );

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
 * Exécuter tous les tests Knowledge Bases
 */
async function runKnowledgeBasesTests() {
  try {
    console.log("🚀 Démarrage des tests Knowledge Bases...\n");

    // Test 1: Lister les bases de connaissances existantes
    const existingKBs = await testListVapiKnowledgeBases();

    // Test 2: Créer une base de connaissances Trieve
    const newTrieveKB = await testCreateVapiKnowledgeBaseTrieve();

    // Test 3: Créer une base de connaissances Custom
    const newCustomKB = await testCreateVapiKnowledgeBaseCustom();

    // Test 4: Récupérer la base Trieve créée
    await testGetVapiKnowledgeBase(newTrieveKB.id);

    // Test 5: Mettre à jour la base Trieve
    await testUpdateVapiKnowledgeBase(newTrieveKB.id);

    // Test 6: Supprimer les bases de test
    await testDeleteVapiKnowledgeBase(newTrieveKB.id);
    await testDeleteVapiKnowledgeBase(newCustomKB.id);

    console.log(
      "\n🎉 Tous les tests Knowledge Bases sont passés avec succès !"
    );
    console.log("\n📊 Résumé:");
    console.log(`   - ${existingKBs.length} bases de connaissances existantes`);
    console.log("   - Création KB Trieve: ✅");
    console.log("   - Création KB Custom: ✅");
    console.log("   - Récupération KB: ✅");
    console.log("   - Mise à jour KB: ✅");
    console.log("   - Suppression KB: ✅");
    console.log("   - API Knowledge Bases Vapi entièrement fonctionnelle");
  } catch (error) {
    console.error("\n❌ Erreur lors des tests Knowledge Bases:", error.message);
    process.exit(1);
  }
}

runKnowledgeBasesTests();
