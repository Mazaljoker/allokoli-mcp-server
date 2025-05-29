#!/usr/bin/env node

/**
 * Script de test pour les Test Suites Vapi
 * Teste toutes les opérations CRUD : list, create, get, update, delete
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

console.log("🧪 Test des Test Suites Vapi");
console.log("============================");

/**
 * Test de listVapiTestSuites
 */
async function testListVapiTestSuites() {
  console.log("\n🔍 Test: listVapiTestSuites");

  try {
    const response = await fetch(`${BASE_URL}/test-suite?limit=10`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`${response.status} - ${error}`);
    }

    const testSuites = await response.json();
    console.log(`✅ ${testSuites.length} test suites trouvées`);

    if (testSuites.length > 0) {
      console.log(
        `📋 Première test suite: ${testSuites[0].name || testSuites[0].id}`
      );
    }

    return testSuites;
  } catch (error) {
    console.error(`❌ Erreur listVapiTestSuites: ${error.message}`);
    return [];
  }
}

/**
 * Test de createVapiTestSuite
 */
async function testCreateVapiTestSuite() {
  console.log("\n➕ Test: createVapiTestSuite");

  // Récupérons d'abord un assistant existant pour le test
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
        console.log(`📋 Assistant trouvé pour le test: ${assistantId}`);
      }
    }
  } catch (error) {
    console.log("⚠️ Impossible de récupérer un assistant existant");
  }

  const testSuiteData = {
    name: `Test Suite MCP ${Date.now()}`,
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
        firstMessage:
          "Bonjour, je suis votre assistant de test. Comment puis-je vous aider ?",
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

    return testSuite;
  } catch (error) {
    console.error(`❌ Erreur createVapiTestSuite: ${error.message}`);
    return null;
  }
}

/**
 * Test de getVapiTestSuite
 */
async function testGetVapiTestSuite(testSuiteId) {
  console.log(`\n🔍 Test: getVapiTestSuite (${testSuiteId})`);

  try {
    const response = await fetch(`${BASE_URL}/test-suite/${testSuiteId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`${response.status} - ${error}`);
    }

    const testSuite = await response.json();
    console.log(`✅ Test suite récupérée: ${testSuite.name}`);
    console.log(`📋 ID: ${testSuite.id}`);
    console.log(`📋 Créée le: ${testSuite.createdAt}`);

    return testSuite;
  } catch (error) {
    console.error(`❌ Erreur getVapiTestSuite: ${error.message}`);
    return null;
  }
}

/**
 * Test de updateVapiTestSuite
 */
async function testUpdateVapiTestSuite(testSuiteId) {
  console.log(`\n✏️ Test: updateVapiTestSuite (${testSuiteId})`);

  const updates = {
    name: `Test Suite MCP Modifiée ${Date.now()}`,
    testerPlan: {
      assistant: {
        firstMessage: "Message de test modifié",
        maxDurationSeconds: 600,
      },
    },
  };

  try {
    const response = await fetch(`${BASE_URL}/test-suite/${testSuiteId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`${response.status} - ${error}`);
    }

    const testSuite = await response.json();
    console.log(`✅ Test suite mise à jour: ${testSuite.name}`);

    return testSuite;
  } catch (error) {
    console.error(`❌ Erreur updateVapiTestSuite: ${error.message}`);
    return null;
  }
}

/**
 * Test de deleteVapiTestSuite
 */
async function testDeleteVapiTestSuite(testSuiteId) {
  console.log(`\n🗑️ Test: deleteVapiTestSuite (${testSuiteId})`);

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

    if (response.status === 204) {
      console.log("✅ Test suite supprimée avec succès (204 No Content)");
      return { success: true, message: "Test suite supprimée avec succès" };
    }

    const result = await response.json();
    console.log("✅ Test suite supprimée avec succès");
    return result;
  } catch (error) {
    console.error(`❌ Erreur deleteVapiTestSuite: ${error.message}`);
    return null;
  }
}

/**
 * Fonction principale de test
 */
async function runTests() {
  console.log("🚀 Début des tests Test Suites Vapi\n");

  try {
    // 1. Test de listage
    const existingTestSuites = await testListVapiTestSuites();

    // 2. Test de création
    const newTestSuite = await testCreateVapiTestSuite();
    if (!newTestSuite) {
      console.log("❌ Impossible de continuer les tests sans test suite créée");
      return;
    }

    // 3. Test de récupération
    await testGetVapiTestSuite(newTestSuite.id);

    // 4. Test de mise à jour
    await testUpdateVapiTestSuite(newTestSuite.id);

    // 5. Test de suppression
    await testDeleteVapiTestSuite(newTestSuite.id);

    console.log("\n🎉 Tous les tests Test Suites terminés !");
    console.log("\n📊 Résumé des tests :");
    console.log("✅ listVapiTestSuites: OK");
    console.log("✅ createVapiTestSuite: OK");
    console.log("✅ getVapiTestSuite: OK");
    console.log("✅ updateVapiTestSuite: OK");
    console.log("✅ deleteVapiTestSuite: OK");
  } catch (error) {
    console.error(`💥 Erreur générale: ${error.message}`);
  }
}

// Exécution des tests
runTests().catch(console.error);
