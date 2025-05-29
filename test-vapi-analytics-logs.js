#!/usr/bin/env node

/**
 * Script de test pour les fonctionnalités Analytics et Logs de l'API Vapi
 * Tests des nouveaux endpoints : createVapiAnalyticsQueries, getVapiLogs, deleteVapiLogs
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

console.log("🚀 Début des tests Analytics et Logs Vapi");
console.log("==========================================");

/**
 * Test des Analytics - Création de requêtes d'analytics
 */
async function testAnalyticsQueries() {
  console.log("\n📊 Test 1: Création de requêtes d'analytics");

  try {
    const analyticsQueries = [
      {
        table: "call",
        name: "total_calls_today",
        operations: [
          {
            operation: "count",
            column: "id",
          },
        ],
        timeRange: {
          start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24h ago
          end: new Date().toISOString(),
          step: "hour",
          timezone: "UTC",
        },
      },
      {
        table: "call",
        name: "average_call_duration",
        operations: [
          {
            operation: "avg",
            column: "cost",
          },
        ],
        groupBy: ["status"],
        timeRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
          end: new Date().toISOString(),
          step: "day",
        },
      },
    ];

    const response = await fetch("https://api.vapi.ai/analytics", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ queries: analyticsQueries }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Requêtes d'analytics créées avec succès");
      console.log(`📈 Nombre de résultats: ${result.length}`);

      // Afficher un aperçu des résultats
      result.forEach((query, index) => {
        console.log(`   Query ${index + 1}: ${query.name}`);
        if (query.result && query.result.length > 0) {
          console.log(`   Résultats: ${query.result.length} entrées`);
        }
      });
    } else {
      const error = await response.text();
      console.log(`⚠️  Réponse Analytics: ${response.status} - ${error}`);
    }
  } catch (error) {
    console.log(`❌ Erreur Analytics: ${error.message}`);
  }
}

/**
 * Test des Logs - Récupération des logs
 */
async function testGetLogs() {
  console.log("\n📋 Test 2: Récupération des logs");

  try {
    const params = new URLSearchParams({
      limit: "10",
      sortOrder: "DESC",
    });

    const response = await fetch(`https://api.vapi.ai/logs?${params}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Logs récupérés avec succès");

      if (result.results) {
        console.log(`📝 Nombre de logs: ${result.results.length}`);
        console.log(
          `📄 Page actuelle: ${result.metadata?.currentPage || "N/A"}`
        );
        console.log(
          `📊 Total d'éléments: ${result.metadata?.totalItems || "N/A"}`
        );

        // Afficher les types de logs trouvés
        const logTypes = [...new Set(result.results.map((log) => log.type))];
        console.log(`🏷️  Types de logs: ${logTypes.join(", ")}`);
      }
    } else {
      const error = await response.text();
      console.log(`⚠️  Réponse Logs GET: ${response.status} - ${error}`);
    }
  } catch (error) {
    console.log(`❌ Erreur Logs GET: ${error.message}`);
  }
}

/**
 * Test des Logs - Récupération avec filtres
 */
async function testGetLogsWithFilters() {
  console.log("\n🔍 Test 3: Récupération des logs avec filtres");

  try {
    const params = new URLSearchParams({
      type: "API",
      limit: "5",
      sortOrder: "DESC",
    });

    const response = await fetch(`https://api.vapi.ai/logs?${params}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✅ Logs filtrés récupérés avec succès");

      if (result.results) {
        console.log(`📝 Logs API trouvés: ${result.results.length}`);

        // Afficher quelques détails des logs API
        result.results.slice(0, 3).forEach((log, index) => {
          console.log(
            `   Log ${index + 1}: ${log.requestHttpMethod || "N/A"} ${
              log.requestPath || "N/A"
            } - ${log.responseHttpCode || "N/A"}`
          );
        });
      }
    } else {
      const error = await response.text();
      console.log(`⚠️  Réponse Logs filtrés: ${response.status} - ${error}`);
    }
  } catch (error) {
    console.log(`❌ Erreur Logs filtrés: ${error.message}`);
  }
}

/**
 * Test des Logs - Suppression (attention: opération destructive)
 */
async function testDeleteLogs() {
  console.log("\n🗑️  Test 4: Test de suppression de logs (simulation)");

  try {
    // Note: On teste avec des paramètres très spécifiques pour éviter de supprimer tous les logs
    const params = new URLSearchParams({
      type: "API",
      // On pourrait ajouter d'autres filtres très spécifiques ici
    });

    console.log(
      "⚠️  ATTENTION: Test de suppression désactivé pour la sécurité"
    );
    console.log("   Pour tester réellement, décommentez le code ci-dessous");
    console.log("   Paramètres qui seraient utilisés:", params.toString());

    /*
    const response = await fetch(`https://api.vapi.ai/logs?${params}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      if (response.status === 204) {
        console.log("✅ Logs supprimés avec succès (204 No Content)");
      } else {
        const result = await response.json();
        console.log("✅ Logs supprimés avec succès");
        console.log("📋 Résultat:", result);
      }
    } else {
      const error = await response.text();
      console.log(`⚠️  Réponse Delete Logs: ${response.status} - ${error}`);
    }
    */

    console.log("✅ Test de suppression simulé avec succès");
  } catch (error) {
    console.log(`❌ Erreur Delete Logs: ${error.message}`);
  }
}

/**
 * Fonction principale de test
 */
async function runTests() {
  try {
    await testAnalyticsQueries();
    await testGetLogs();
    await testGetLogsWithFilters();
    await testDeleteLogs();

    console.log("\n🎉 Tests Analytics et Logs terminés !");
    console.log("=====================================");
    console.log("✅ Analytics: Requêtes d'analytics testées");
    console.log("✅ Logs: Récupération testée");
    console.log("✅ Logs: Filtrage testé");
    console.log("✅ Logs: Suppression simulée");
  } catch (error) {
    console.error("❌ Erreur lors des tests:", error);
    process.exit(1);
  }
}

// Exécuter les tests
runTests();
