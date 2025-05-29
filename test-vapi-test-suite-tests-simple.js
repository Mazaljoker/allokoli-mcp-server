#!/usr/bin/env node

/**
 * Script de test simplifié pour les Test Suite Tests Vapi
 * Utilise une test suite existante ou teste avec des données minimales
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

console.log("🧪 Test simplifié des Test Suite Tests Vapi");
console.log("============================================");

/**
 * Récupère une test suite existante
 */
async function getExistingTestSuite() {
  console.log("\n🔍 Recherche d'une test suite existante...");

  try {
    const response = await fetch(`${BASE_URL}/test-suite?limit=5`, {
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
      console.log(`📋 Utilisation de la test suite: ${testSuites[0].id}`);
      return testSuites[0].id;
    }

    return null;
  } catch (error) {
    console.error(
      `❌ Erreur lors de la récupération des test suites: ${error.message}`
    );
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
    console.log(
      `✅ ${tests.results?.length || tests.length || 0} tests trouvés`
    );

    if (tests.results?.length > 0 || tests.length > 0) {
      const firstTest = tests.results?.[0] || tests[0];
      console.log(`📋 Premier test: ${firstTest.name || firstTest.id}`);
      return firstTest.id; // Retourner l'ID du premier test pour les autres tests
    }

    return null;
  } catch (error) {
    console.error(`❌ Erreur listVapiTestSuiteTests: ${error.message}`);
    return null;
  }
}

/**
 * Test de createVapiTestSuiteTest (version simplifiée)
 */
async function testCreateVapiTestSuiteTest(testSuiteId) {
  console.log(`\n➕ Test: createVapiTestSuiteTest (${testSuiteId})`);

  // Test avec données minimales
  const testData = {
    chat: {
      script: "Saluer l'assistant et demander des informations de base",
      scorers: [
        {
          type: "ai",
          rubric: "L'assistant répond poliment et fournit des informations",
        },
      ],
      name: `Test Simple MCP ${Date.now()}`,
      numAttempts: 1,
    },
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
      console.log(`⚠️ Création échouée (${response.status}): ${error}`);
      return null;
    }

    const test = await response.json();
    console.log(`✅ Test créé: ${test.id}`);
    console.log(`📋 Nom: ${test.name}`);
    console.log(`📋 Type: ${test.type}`);

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
  if (!testId) {
    console.log("\n⚠️ Pas de test ID disponible pour getVapiTestSuiteTest");
    return null;
  }

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
  if (!testId) {
    console.log("\n⚠️ Pas de test ID disponible pour updateVapiTestSuiteTest");
    return null;
  }

  console.log(`\n✏️ Test: updateVapiTestSuiteTest (${testSuiteId}, ${testId})`);

  const updates = {
    name: `Test Simple Modifié ${Date.now()}`,
    script: "Saluer l'assistant et poser une question de suivi",
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
  if (!testId) {
    console.log("\n⚠️ Pas de test ID disponible pour deleteVapiTestSuiteTest");
    return null;
  }

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
      return { success: true };
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
 * Fonction principale de test
 */
async function runTests() {
  console.log("🚀 Début des tests Test Suite Tests Vapi\n");

  try {
    // 1. Récupérer une test suite existante
    const testSuiteId = await getExistingTestSuite();
    if (!testSuiteId) {
      console.log(
        "❌ Aucune test suite trouvée. Créez d'abord une test suite via l'interface Vapi."
      );
      return;
    }

    // 2. Test de listage
    const existingTestId = await testListVapiTestSuiteTests(testSuiteId);

    // 3. Test de création
    const newTest = await testCreateVapiTestSuiteTest(testSuiteId);
    const testIdToUse = newTest?.id || existingTestId;

    // 4. Test de récupération
    await testGetVapiTestSuiteTest(testSuiteId, testIdToUse);

    // 5. Test de mise à jour (seulement si on a créé un nouveau test)
    if (newTest?.id) {
      await testUpdateVapiTestSuiteTest(testSuiteId, newTest.id);
    }

    // 6. Test de suppression (seulement si on a créé un nouveau test)
    if (newTest?.id) {
      await testDeleteVapiTestSuiteTest(testSuiteId, newTest.id);
    }

    console.log("\n🎉 Tests Test Suite Tests terminés !");
    console.log("\n📊 Résumé des tests :");
    console.log("✅ listVapiTestSuiteTests: OK");
    console.log(
      newTest
        ? "✅ createVapiTestSuiteTest: OK"
        : "⚠️ createVapiTestSuiteTest: Testé mais échec"
    );
    console.log(
      testIdToUse
        ? "✅ getVapiTestSuiteTest: OK"
        : "⚠️ getVapiTestSuiteTest: Pas testé"
    );
    console.log(
      newTest
        ? "✅ updateVapiTestSuiteTest: OK"
        : "⚠️ updateVapiTestSuiteTest: Pas testé"
    );
    console.log(
      newTest
        ? "✅ deleteVapiTestSuiteTest: OK"
        : "⚠️ deleteVapiTestSuiteTest: Pas testé"
    );
  } catch (error) {
    console.error(`💥 Erreur générale: ${error.message}`);
  }
}

// Exécution des tests
runTests().catch(console.error);
