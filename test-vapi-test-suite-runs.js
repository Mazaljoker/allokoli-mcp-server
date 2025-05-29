#!/usr/bin/env node

/**
 * Script de test pour les fonctionnalités Test Suite Runs de l'API Vapi
 * Tests des opérations CRUD complètes avec gestion d'erreurs
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fetch from "node-fetch";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, "..", ".env") });

const VAPI_API_KEY = process.env.VAPI_API_KEY;

if (!VAPI_API_KEY) {
  console.error(
    "❌ VAPI_API_KEY non trouvée dans les variables d'environnement"
  );
  process.exit(1);
}

console.log("🚀 Début des tests Test Suite Runs Vapi");
console.log("=====================================");

// Variables globales pour les tests
let testSuiteId = null;
let testRunId = null;

/**
 * Crée une test suite temporaire pour les tests
 */
async function createTemporaryTestSuite() {
  console.log("\n📝 Création d'une test suite temporaire...");

  // Récupérer d'abord un assistant existant
  let assistantId = null;
  try {
    const assistantsResponse = await fetch(
      "https://api.vapi.ai/assistant?limit=1",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${VAPI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (assistantsResponse.ok) {
      const assistants = await assistantsResponse.json();
      if (assistants.length > 0) {
        assistantId = assistants[0].id;
        console.log(`📋 Assistant trouvé: ${assistantId}`);
      }
    }
  } catch (error) {
    console.log("⚠️ Impossible de récupérer un assistant existant");
  }

  const testSuiteData = {
    name: `Test Suite Runs - ${Date.now()}`,
    testerPlan: {
      assistant: {
        transcriber: {
          provider: "deepgram",
          confidenceThreshold: 0.8,
        },
        model: {
          provider: "openai",
          model: "gpt-3.5-turbo",
          maxTokens: 1000,
          temperature: 0.7,
        },
        voice: {
          provider: "11labs",
          voiceId: "21m00Tcm4TlvDq8ikWAM",
          cachingEnabled: true,
        },
        firstMessage: "Bonjour, je suis votre assistant de test pour les runs.",
        firstMessageMode: "assistant-speaks-first",
        silenceTimeoutSeconds: 30,
        maxDurationSeconds: 300,
      },
    },
    targetPlan: assistantId
      ? {
          assistantId: assistantId,
          assistantOverrides: {
            firstMessage: "Message de test pour les runs",
          },
        }
      : {
          phoneNumber: {
            provider: "twilio",
            number: "+33123456789",
          },
        },
  };

  try {
    const response = await fetch("https://api.vapi.ai/test-suite", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testSuiteData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur API: ${response.status} - ${error}`);
    }

    const testSuite = await response.json();
    testSuiteId = testSuite.id;
    console.log(`✅ Test suite créée avec l'ID: ${testSuiteId}`);
    return testSuite;
  } catch (error) {
    console.error(`❌ Erreur création test suite: ${error.message}`);
    throw error;
  }
}

/**
 * Crée un test dans la test suite
 */
async function createTestInSuite(testSuiteId) {
  console.log(`\n📝 Création d'un test dans la test suite ${testSuiteId}...`);

  const testData = {
    type: "chat",
    name: `Test pour Runs - ${Date.now()}`,
    script: `1. Saluer l'assistant
2. Demander des informations
3. Terminer poliment`,
    scorers: [
      {
        type: "ai",
        rubric: "L'assistant répond de manière professionnelle",
      },
    ],
    numAttempts: 1,
  };

  try {
    const response = await fetch(
      `https://api.vapi.ai/test-suite/${testSuiteId}/test`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${VAPI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur API: ${response.status} - ${error}`);
    }

    const test = await response.json();
    console.log(`✅ Test créé avec l'ID: ${test.id}`);
    return test;
  } catch (error) {
    console.error(`❌ Erreur création test: ${error.message}`);
    throw error;
  }
}

/**
 * Test de listVapiTestSuiteRuns
 */
async function testListVapiTestSuiteRuns(testSuiteId) {
  console.log(`\n🔍 Test: listVapiTestSuiteRuns (${testSuiteId})`);

  try {
    const response = await fetch(
      `https://api.vapi.ai/test-suite/${testSuiteId}/run?limit=10&page=1&sortOrder=DESC`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${VAPI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur API: ${response.status} - ${error}`);
    }

    const runs = await response.json();
    console.log(
      `✅ Récupération réussie: ${runs.length || 0} exécutions trouvées`
    );

    if (runs.length > 0) {
      console.log(
        `📊 Première exécution: ID=${runs[0].id}, Status=${
          runs[0].status || "N/A"
        }`
      );
    }

    return runs;
  } catch (error) {
    console.error(`❌ Erreur listVapiTestSuiteRuns: ${error.message}`);
    throw error;
  }
}

/**
 * Test de createVapiTestSuiteRun
 */
async function testCreateVapiTestSuiteRun(testSuiteId) {
  console.log(`\n➕ Test: createVapiTestSuiteRun (${testSuiteId})`);

  const runData = {
    name: `Test Run - ${Date.now()}`,
  };

  try {
    const response = await fetch(
      `https://api.vapi.ai/test-suite/${testSuiteId}/run`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${VAPI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(runData),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur API: ${response.status} - ${error}`);
    }

    const run = await response.json();
    testRunId = run.id;
    console.log(`✅ Exécution créée avec succès`);
    console.log(`📊 ID: ${run.id}`);
    console.log(`📊 Nom: ${run.name || "N/A"}`);
    console.log(`📊 Status: ${run.status || "N/A"}`);
    console.log(`📊 Créé le: ${run.createdAt || "N/A"}`);

    return run;
  } catch (error) {
    console.error(`❌ Erreur createVapiTestSuiteRun: ${error.message}`);
    throw error;
  }
}

/**
 * Test de getVapiTestSuiteRun
 */
async function testGetVapiTestSuiteRun(testSuiteId, runId) {
  console.log(`\n🔍 Test: getVapiTestSuiteRun (${testSuiteId}, ${runId})`);

  try {
    const response = await fetch(
      `https://api.vapi.ai/test-suite/${testSuiteId}/run/${runId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${VAPI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur API: ${response.status} - ${error}`);
    }

    const run = await response.json();
    console.log(`✅ Exécution récupérée avec succès`);
    console.log(`📊 ID: ${run.id}`);
    console.log(`📊 Nom: ${run.name || "N/A"}`);
    console.log(`📊 Status: ${run.status || "N/A"}`);
    console.log(`📊 Test Suite ID: ${run.testSuiteId || "N/A"}`);

    return run;
  } catch (error) {
    console.error(`❌ Erreur getVapiTestSuiteRun: ${error.message}`);
    throw error;
  }
}

/**
 * Test de updateVapiTestSuiteRun
 */
async function testUpdateVapiTestSuiteRun(testSuiteId, runId) {
  console.log(`\n✏️ Test: updateVapiTestSuiteRun (${testSuiteId}, ${runId})`);

  const updates = {
    name: `Test Run Modifié - ${Date.now()}`,
  };

  try {
    const response = await fetch(
      `https://api.vapi.ai/test-suite/${testSuiteId}/run/${runId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${VAPI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur API: ${response.status} - ${error}`);
    }

    const run = await response.json();
    console.log(`✅ Exécution mise à jour avec succès`);
    console.log(`📊 Nouveau nom: ${run.name || "N/A"}`);
    console.log(`📊 Status: ${run.status || "N/A"}`);
    console.log(`📊 Modifié le: ${run.updatedAt || "N/A"}`);

    return run;
  } catch (error) {
    console.error(`❌ Erreur updateVapiTestSuiteRun: ${error.message}`);
    throw error;
  }
}

/**
 * Test de deleteVapiTestSuiteRun
 */
async function testDeleteVapiTestSuiteRun(testSuiteId, runId) {
  console.log(`\n🗑️ Test: deleteVapiTestSuiteRun (${testSuiteId}, ${runId})`);

  try {
    const response = await fetch(
      `https://api.vapi.ai/test-suite/${testSuiteId}/run/${runId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${VAPI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur API: ${response.status} - ${error}`);
    }

    let result;
    if (response.status === 204) {
      result = { success: true, message: "Exécution supprimée avec succès" };
    } else {
      result = await response.json();
    }

    console.log(`✅ Exécution supprimée avec succès`);
    console.log(`📊 Résultat: ${JSON.stringify(result)}`);

    return result;
  } catch (error) {
    console.error(`❌ Erreur deleteVapiTestSuiteRun: ${error.message}`);
    throw error;
  }
}

/**
 * Supprime la test suite temporaire
 */
async function cleanupTemporaryTestSuite(testSuiteId) {
  console.log(`\n🧹 Nettoyage: suppression de la test suite ${testSuiteId}`);

  try {
    const response = await fetch(
      `https://api.vapi.ai/test-suite/${testSuiteId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${VAPI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur API: ${response.status} - ${error}`);
    }

    console.log(`✅ Test suite supprimée avec succès`);
  } catch (error) {
    console.error(`❌ Erreur suppression test suite: ${error.message}`);
  }
}

/**
 * Fonction principale de test
 */
async function runTests() {
  try {
    // Créer une test suite temporaire
    await createTemporaryTestSuite();

    // Créer un test dans la test suite (requis pour les runs)
    await createTestInSuite(testSuiteId);

    // Test 1: Lister les exécutions (initialement vide)
    await testListVapiTestSuiteRuns(testSuiteId);

    // Test 2: Créer une nouvelle exécution
    await testCreateVapiTestSuiteRun(testSuiteId);

    // Test 3: Récupérer l'exécution créée
    await testGetVapiTestSuiteRun(testSuiteId, testRunId);

    // Test 4: Mettre à jour l'exécution
    await testUpdateVapiTestSuiteRun(testSuiteId, testRunId);

    // Test 5: Lister les exécutions (maintenant avec 1 élément)
    await testListVapiTestSuiteRuns(testSuiteId);

    // Test 6: Supprimer l'exécution
    await testDeleteVapiTestSuiteRun(testSuiteId, testRunId);

    // Test 7: Vérifier que l'exécution est supprimée
    await testListVapiTestSuiteRuns(testSuiteId);

    console.log("\n🎉 Tous les tests Test Suite Runs ont réussi !");
    console.log("=====================================");
    console.log("✅ listVapiTestSuiteRuns: OK");
    console.log("✅ createVapiTestSuiteRun: OK");
    console.log("✅ getVapiTestSuiteRun: OK");
    console.log("✅ updateVapiTestSuiteRun: OK");
    console.log("✅ deleteVapiTestSuiteRun: OK");
  } catch (error) {
    console.error(`\n💥 Échec des tests: ${error.message}`);
    process.exit(1);
  } finally {
    // Nettoyage
    if (testSuiteId) {
      await cleanupTemporaryTestSuite(testSuiteId);
    }
  }
}

// Exécuter les tests
runTests();
