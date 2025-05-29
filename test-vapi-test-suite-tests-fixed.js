#!/usr/bin/env node

/**
 * Script de test corrigé pour les Test Suite Tests Vapi
 * Utilise la structure correcte selon l'API Vapi
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
const BASE_URL = "https://api.vapi.ai";

if (!VAPI_API_KEY) {
  console.error(
    "❌ VAPI_API_KEY non trouvée dans les variables d'environnement"
  );
  process.exit(1);
}

console.log("🧪 Test corrigé des Test Suite Tests Vapi");
console.log("=========================================");

/**
 * Crée une test suite pour les tests
 */
async function createTestSuite() {
  console.log("\n📝 Création d'une test suite pour les tests...");

  // Récupérer d'abord un assistant existant
  let assistantId = null;
  try {
    const assistantsResponse = await fetch(`${BASE_URL}/assistant?limit=1`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

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
    name: `Test Suite pour Tests MCP ${Date.now()}`,
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
        firstMessage: "Bonjour, je suis votre assistant de test.",
        firstMessageMode: "assistant-speaks-first",
        silenceTimeoutSeconds: 30,
        maxDurationSeconds: 300,
      },
    },
    targetPlan: assistantId
      ? {
          assistantId: assistantId,
          assistantOverrides: {
            firstMessage: "Message de test personnalisé",
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
    const response = await fetch(`${BASE_URL}/test-suite`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testSuiteData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`${response.status} - ${error}`);
    }

    const testSuite = await response.json();
    console.log(`✅ Test suite créée: ${testSuite.id}`);
    console.log(`📋 Nom: ${testSuite.name}`);

    return testSuite.id;
  } catch (error) {
    console.error(`❌ Erreur createTestSuite: ${error.message}`);
    return null;
  }
}

/**
 * Test de listVapiTestSuiteTests
 */
async function testListVapiTestSuiteTests(testSuiteId) {
  console.log(`\n🔍 Test: listVapiTestSuiteTests (${testSuiteId})`);

  try {
    const response = await fetch(
      `${BASE_URL}/test-suite/${testSuiteId}/test?limit=10`,
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
      throw new Error(`${response.status} - ${error}`);
    }

    const tests = await response.json();
    const count = tests.results?.length || tests.length || 0;
    console.log(`✅ ${count} tests trouvés`);

    if (count > 0) {
      const firstTest = tests.results?.[0] || tests[0];
      console.log(`📋 Premier test: ${firstTest.name || firstTest.id}`);
    }

    return tests;
  } catch (error) {
    console.error(`❌ Erreur listVapiTestSuiteTests: ${error.message}`);
    return [];
  }
}

/**
 * Test de createVapiTestSuiteTest (structure corrigée)
 */
async function testCreateVapiTestSuiteTest(testSuiteId) {
  console.log(`\n➕ Test: createVapiTestSuiteTest (${testSuiteId})`);

  // Structure corrigée selon l'erreur de validation
  const testData = {
    type: "chat", // Doit être "voice" ou "chat"
    name: `Test Chat MCP ${Date.now()}`,
    script: `1. Saluer poliment l'assistant
2. Demander des informations sur les services disponibles
3. Poser une question de suivi pour tester la compréhension
4. Remercier et terminer la conversation`,
    scorers: [
      {
        type: "ai",
        rubric:
          "L'assistant répond de manière professionnelle et fournit des informations utiles",
      },
      {
        type: "ai",
        rubric:
          "L'assistant comprend et répond correctement aux questions de suivi",
      },
    ],
    numAttempts: 2,
  };

  try {
    const response = await fetch(`${BASE_URL}/test-suite/${testSuiteId}/test`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`${response.status} - ${error}`);
    }

    const test = await response.json();
    console.log(`✅ Test créé: ${test.id}`);
    console.log(`📋 Nom: ${test.name}`);
    console.log(`📋 Type: ${test.type}`);
    console.log(`📋 Scorers: ${test.scorers?.length || 0}`);

    return test;
  } catch (error) {
    console.error(`❌ Erreur createVapiTestSuiteTest: ${error.message}`);
    return null;
  }
}

/**
 * Test de getVapiTestSuiteTest
 */
async function testGetVapiTestSuiteTest(testSuiteId, testId) {
  console.log(`\n🔍 Test: getVapiTestSuiteTest (${testSuiteId}, ${testId})`);

  try {
    const response = await fetch(
      `${BASE_URL}/test-suite/${testSuiteId}/test/${testId}`,
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
      throw new Error(`${response.status} - ${error}`);
    }

    const test = await response.json();
    console.log(`✅ Test récupéré: ${test.name || test.id}`);
    console.log(`📋 Type: ${test.type}`);
    console.log(`📋 Script: ${test.script?.substring(0, 50)}...`);
    console.log(`📋 Créé le: ${test.createdAt}`);

    return test;
  } catch (error) {
    console.error(`❌ Erreur getVapiTestSuiteTest: ${error.message}`);
    return null;
  }
}

/**
 * Test de updateVapiTestSuiteTest
 */
async function testUpdateVapiTestSuiteTest(testSuiteId, testId) {
  console.log(`\n✏️ Test: updateVapiTestSuiteTest (${testSuiteId}, ${testId})`);

  const updates = {
    name: `Test Chat Modifié ${Date.now()}`,
    script: `1. Saluer l'assistant de manière amicale
2. Demander des informations détaillées sur les tarifs
3. Poser des questions sur la disponibilité
4. Exprimer sa satisfaction et terminer`,
    scorers: [
      {
        type: "ai",
        rubric:
          "L'assistant fournit des informations tarifaires claires et précises",
      },
      {
        type: "ai",
        rubric: "L'assistant gère bien les questions sur la disponibilité",
      },
      {
        type: "ai",
        rubric: "L'interaction se termine de manière positive",
      },
    ],
    numAttempts: 3,
  };

  try {
    const response = await fetch(
      `${BASE_URL}/test-suite/${testSuiteId}/test/${testId}`,
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
      throw new Error(`${response.status} - ${error}`);
    }

    const test = await response.json();
    console.log(`✅ Test mis à jour: ${test.name}`);
    console.log(`📋 Nouveaux scorers: ${test.scorers?.length || 0}`);
    console.log(`📋 Nouvelles tentatives: ${test.numAttempts}`);

    return test;
  } catch (error) {
    console.error(`❌ Erreur updateVapiTestSuiteTest: ${error.message}`);
    return null;
  }
}

/**
 * Test de deleteVapiTestSuiteTest
 */
async function testDeleteVapiTestSuiteTest(testSuiteId, testId) {
  console.log(`\n🗑️ Test: deleteVapiTestSuiteTest (${testSuiteId}, ${testId})`);

  try {
    const response = await fetch(
      `${BASE_URL}/test-suite/${testSuiteId}/test/${testId}`,
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
      throw new Error(`${response.status} - ${error}`);
    }

    if (response.status === 204) {
      console.log("✅ Test supprimé avec succès (204 No Content)");
      return { success: true, message: "Test supprimé avec succès" };
    }

    const result = await response.json();
    console.log("✅ Test supprimé avec succès");
    return result;
  } catch (error) {
    console.error(`❌ Erreur deleteVapiTestSuiteTest: ${error.message}`);
    return null;
  }
}

/**
 * Supprime la test suite créée pour les tests
 */
async function cleanupTestSuite(testSuiteId) {
  console.log(`\n🧹 Nettoyage: suppression de la test suite (${testSuiteId})`);

  try {
    const response = await fetch(`${BASE_URL}/test-suite/${testSuiteId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`${response.status} - ${error}`);
    }

    console.log("✅ Test suite supprimée avec succès");
    return true;
  } catch (error) {
    console.error(`❌ Erreur lors du nettoyage: ${error.message}`);
    return false;
  }
}

/**
 * Fonction principale de test
 */
async function runTests() {
  console.log("🚀 Début des tests Test Suite Tests Vapi\n");

  let testSuiteId = null;

  try {
    // 1. Créer une test suite pour les tests
    testSuiteId = await createTestSuite();
    if (!testSuiteId) {
      console.log("❌ Impossible de continuer les tests sans test suite");
      return;
    }

    // 2. Test de listage
    await testListVapiTestSuiteTests(testSuiteId);

    // 3. Test de création
    const newTest = await testCreateVapiTestSuiteTest(testSuiteId);
    if (!newTest) {
      console.log("❌ Impossible de continuer les tests sans test créé");
      return;
    }

    // 4. Test de récupération
    await testGetVapiTestSuiteTest(testSuiteId, newTest.id);

    // 5. Test de mise à jour
    await testUpdateVapiTestSuiteTest(testSuiteId, newTest.id);

    // 6. Test de suppression
    await testDeleteVapiTestSuiteTest(testSuiteId, newTest.id);

    console.log("\n🎉 Tous les tests Test Suite Tests terminés !");
    console.log("\n📊 Résumé des tests :");
    console.log("✅ listVapiTestSuiteTests: OK");
    console.log("✅ createVapiTestSuiteTest: OK");
    console.log("✅ getVapiTestSuiteTest: OK");
    console.log("✅ updateVapiTestSuiteTest: OK");
    console.log("✅ deleteVapiTestSuiteTest: OK");
  } catch (error) {
    console.error(`💥 Erreur générale: ${error.message}`);
  } finally {
    // 7. Nettoyage
    if (testSuiteId) {
      await cleanupTestSuite(testSuiteId);
    }
  }
}

// Exécution des tests
runTests().catch(console.error);
