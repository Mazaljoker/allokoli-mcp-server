#!/usr/bin/env node

/**
 * Démonstration : SDK Vapi vs Approche Manuelle
 * Compare les deux approches pour les Workflows
 */

import { VapiClient, VapiError } from "@vapi-ai/server-sdk";
import fetch from "node-fetch";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Charger les variables d'environnement
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, "../.env") });

const vapiApiKey = process.env.VAPI_API_KEY;

if (!vapiApiKey) {
  console.error("❌ VAPI_API_KEY non définie");
  process.exit(1);
}

console.log("🚀 Démonstration : SDK Vapi vs Approche Manuelle");
console.log("================================================");

// ===== APPROCHE MANUELLE (ACTUELLE) =====

async function listWorkflowsManual() {
  console.log("\n📝 APPROCHE MANUELLE (Actuelle)");
  console.log("================================");

  const startTime = Date.now();

  try {
    const response = await fetch("https://api.vapi.ai/workflow?limit=5", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${vapiApiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erreur API Vapi: ${response.status} - ${error}`);
    }

    const workflows = await response.json();
    const endTime = Date.now();

    console.log(`✅ Succès en ${endTime - startTime}ms`);
    console.log(`📊 ${workflows.length} workflow(s) récupéré(s)`);
    console.log(`📏 Lignes de code: ~15 lignes`);
    console.log(`🎯 Types: any (pas de validation)`);
    console.log(`🛡️ Gestion d'erreurs: manuelle`);
    console.log(`🔄 Retry: aucun`);

    return workflows;
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`);
    throw error;
  }
}

// ===== APPROCHE SDK =====

async function listWorkflowsSDK() {
  console.log("\n🚀 APPROCHE SDK (Nouvelle)");
  console.log("===========================");

  const startTime = Date.now();

  try {
    const client = new VapiClient({ token: vapiApiKey });
    const workflows = await client.workflows.list({ limit: 5 });
    const endTime = Date.now();

    console.log(`✅ Succès en ${endTime - startTime}ms`);
    console.log(`📊 ${workflows.length} workflow(s) récupéré(s)`);
    console.log(`📏 Lignes de code: ~3 lignes`);
    console.log(`🎯 Types: Vapi.Workflow[] (validation complète)`);
    console.log(`🛡️ Gestion d'erreurs: automatique avec VapiError`);
    console.log(`🔄 Retry: automatique (408, 429, 5XX)`);

    return workflows;
  } catch (error) {
    if (error instanceof VapiError) {
      console.log(`❌ VapiError: ${error.statusCode} - ${error.message}`);
      console.log(`📋 Détails:`, error.body);
    } else {
      console.log(`❌ Erreur: ${error.message}`);
    }
    throw error;
  }
}

// ===== DÉMONSTRATION CRÉATION AVEC SDK =====

async function createWorkflowSDK() {
  console.log("\n🎯 CRÉATION AVEC SDK (Bonus)");
  console.log("=============================");

  try {
    const client = new VapiClient({ token: vapiApiKey });

    // Types complets et autocomplétion
    const workflowData = {
      name: "Demo SDK Workflow",
      nodes: [
        {
          type: "conversation",
          name: "start",
          isStart: true,
        },
        {
          type: "hangup",
          name: "end",
        },
      ],
      edges: [
        {
          from: "start",
          to: "end",
        },
      ],
      model: {
        provider: "openai",
        model: "gpt-3.5-turbo",
        maxTokens: 200,
        temperature: 0.7,
      },
    };

    const workflow = await client.workflows.create(workflowData);
    console.log(`✅ Workflow créé: ${workflow.id}`);
    console.log(`📝 Nom: ${workflow.name}`);
    console.log(`🎯 Types automatiques pour toutes les propriétés`);

    // Nettoyage
    await client.workflows.delete(workflow.id);
    console.log(`🗑️ Workflow supprimé (nettoyage)`);
  } catch (error) {
    if (error instanceof VapiError) {
      console.log(`❌ VapiError: ${error.statusCode} - ${error.message}`);
    } else {
      console.log(`❌ Erreur: ${error.message}`);
    }
  }
}

// ===== COMPARAISON AVANCÉE =====

async function demonstrateAdvancedFeatures() {
  console.log("\n⚡ FONCTIONNALITÉS AVANCÉES DU SDK");
  console.log("==================================");

  const client = new VapiClient({
    token: vapiApiKey,
    // Configuration globale
    timeoutInSeconds: 30,
    maxRetries: 2,
  });

  try {
    // Timeout personnalisé par requête
    const workflows = await client.workflows.list(
      { limit: 3 },
      {
        timeoutInSeconds: 10,
        maxRetries: 1,
      }
    );

    console.log(
      `✅ Requête avec timeout personnalisé: ${workflows.length} résultats`
    );
    console.log(`⏱️ Timeout: 10s (au lieu de 30s par défaut)`);
    console.log(`🔄 Retry: 1 (au lieu de 2 par défaut)`);
  } catch (error) {
    console.log(`❌ Erreur avec configuration avancée: ${error.message}`);
  }
}

// ===== EXÉCUTION DE LA DÉMONSTRATION =====

async function runDemo() {
  try {
    // Test des deux approches
    await listWorkflowsManual();
    await listWorkflowsSDK();

    // Fonctionnalités avancées
    await createWorkflowSDK();
    await demonstrateAdvancedFeatures();

    console.log("\n🎉 CONCLUSION DE LA DÉMONSTRATION");
    console.log("=================================");
    console.log("📊 COMPARAISON RÉSUMÉE:");
    console.log("   📝 Code: SDK = 80% moins de lignes");
    console.log("   🎯 Types: SDK = validation complète");
    console.log("   🛡️ Erreurs: SDK = gestion automatique");
    console.log("   🔄 Retry: SDK = automatique");
    console.log("   ⏱️ Timeout: SDK = configurable");
    console.log("   🚀 DX: SDK = expérience développeur supérieure");

    console.log("\n💡 RECOMMANDATIONS:");
    console.log("   ✅ Pour nouveaux projets: Utiliser le SDK");
    console.log("   🤔 Pour MCP Allokoli: Évaluer la migration");
    console.log("   🎯 Avantages: Moins de code, plus de robustesse");
    console.log("   ⚠️ Inconvénients: Dépendance supplémentaire");
  } catch (error) {
    console.error("❌ Erreur lors de la démonstration:", error.message);
  }
}

// Exécuter la démonstration
runDemo();
