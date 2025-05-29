#!/usr/bin/env node

/**
 * Démonstration : Avantages du SDK Vapi Server TypeScript
 * Utilise les endpoints disponibles (assistants, calls)
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

console.log("🚀 Démonstration : Avantages du SDK Vapi Server TypeScript");
console.log("=========================================================");

// ===== APPROCHE MANUELLE (ACTUELLE) =====

async function listAssistantsManual() {
  console.log("\n📝 APPROCHE MANUELLE (Actuelle)");
  console.log("================================");

  const startTime = Date.now();

  try {
    const response = await fetch("https://api.vapi.ai/assistant?limit=3", {
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

    const assistants = await response.json();
    const endTime = Date.now();

    console.log(`✅ Succès en ${endTime - startTime}ms`);
    console.log(`📊 ${assistants.length} assistant(s) récupéré(s)`);
    console.log(`📏 Lignes de code: ~15 lignes`);
    console.log(`🎯 Types: any (pas de validation)`);
    console.log(`🛡️ Gestion d'erreurs: manuelle`);
    console.log(`🔄 Retry: aucun`);

    if (assistants.length > 0) {
      console.log(
        `📋 Premier assistant: ${assistants[0].name || assistants[0].id}`
      );
    }

    return assistants;
  } catch (error) {
    console.log(`❌ Erreur: ${error.message}`);
    throw error;
  }
}

// ===== APPROCHE SDK =====

async function listAssistantsSDK() {
  console.log("\n🚀 APPROCHE SDK (Nouvelle)");
  console.log("===========================");

  const startTime = Date.now();

  try {
    const client = new VapiClient({ token: vapiApiKey });
    const assistants = await client.assistants.list({ limit: 3 });
    const endTime = Date.now();

    console.log(`✅ Succès en ${endTime - startTime}ms`);
    console.log(`📊 ${assistants.length} assistant(s) récupéré(s)`);
    console.log(`📏 Lignes de code: ~3 lignes`);
    console.log(`🎯 Types: Vapi.Assistant[] (validation complète)`);
    console.log(`🛡️ Gestion d'erreurs: automatique avec VapiError`);
    console.log(`🔄 Retry: automatique (408, 429, 5XX)`);

    if (assistants.length > 0) {
      console.log(
        `📋 Premier assistant: ${assistants[0].name || assistants[0].id}`
      );
    }

    return assistants;
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

// ===== DÉMONSTRATION GESTION D'ERREURS AVANCÉE =====

async function demonstrateErrorHandling() {
  console.log("\n🛡️ GESTION D'ERREURS AVANCÉE");
  console.log("=============================");

  try {
    const client = new VapiClient({ token: vapiApiKey });

    // Tentative d'accès à un assistant inexistant
    await client.assistants.get("assistant-inexistant-12345");
  } catch (error) {
    if (error instanceof VapiError) {
      console.log(`✅ VapiError capturée correctement:`);
      console.log(`   📊 Status Code: ${error.statusCode}`);
      console.log(`   📝 Message: ${error.message}`);
      console.log(
        `   🔍 Type d'erreur: ${
          error.statusCode === 404 ? "Not Found" : "Autre"
        }`
      );
      console.log(`   🎯 Gestion automatique des types d'erreurs !`);
    } else {
      console.log(`❌ Erreur non-Vapi: ${error.message}`);
    }
  }
}

// ===== DÉMONSTRATION CONFIGURATION AVANCÉE =====

async function demonstrateAdvancedConfig() {
  console.log("\n⚡ CONFIGURATION AVANCÉE");
  console.log("========================");

  try {
    // Client avec configuration personnalisée
    const client = new VapiClient({
      token: vapiApiKey,
      timeoutInSeconds: 15, // Timeout global
      maxRetries: 1, // Retry global
    });

    // Requête avec configuration spécifique
    const assistants = await client.assistants.list(
      { limit: 2 },
      {
        timeoutInSeconds: 5, // Override timeout pour cette requête
        maxRetries: 0, // Pas de retry pour cette requête
      }
    );

    console.log(`✅ Configuration avancée appliquée:`);
    console.log(`   ⏱️ Timeout: 5s (override)`);
    console.log(`   🔄 Retry: 0 (override)`);
    console.log(`   📊 Résultats: ${assistants.length} assistants`);
  } catch (error) {
    console.log(`❌ Erreur avec config avancée: ${error.message}`);
  }
}

// ===== COMPARAISON DES TYPES =====

function demonstrateTypes() {
  console.log("\n🎯 AVANTAGES DES TYPES TYPESCRIPT");
  console.log("==================================");

  console.log("📝 APPROCHE MANUELLE:");
  console.log("   const assistant = await response.json(); // Type: any");
  console.log(
    "   console.log(assistant.nam); // ❌ Erreur de typo non détectée"
  );
  console.log(
    "   console.log(assistant.unknownField); // ❌ Pas de validation"
  );

  console.log("\n🚀 APPROCHE SDK:");
  console.log(
    "   const assistant: Vapi.Assistant = await client.assistants.get(id);"
  );
  console.log(
    "   console.log(assistant.name); // ✅ Autocomplétion + validation"
  );
  console.log(
    "   console.log(assistant.model.provider); // ✅ Types imbriqués"
  );
  console.log(
    "   // assistant.unknownField; // ❌ Erreur TypeScript à la compilation"
  );
}

// ===== COMPARAISON DU CODE =====

function demonstrateCodeComparison() {
  console.log("\n📊 COMPARAISON DU CODE");
  console.log("======================");

  console.log("📝 APPROCHE MANUELLE (15+ lignes):");
  console.log(`   async function getAssistant(id) {
     const response = await fetch(\`https://api.vapi.ai/assistant/\${id}\`, {
       method: "GET",
       headers: {
         Authorization: \`Bearer \${apiKey}\`,
         "Content-Type": "application/json",
       },
     });
     
     if (!response.ok) {
       const error = await response.text();
       throw new Error(\`Erreur: \${response.status} - \${error}\`);
     }
     
     return await response.json();
   }`);

  console.log("\n🚀 APPROCHE SDK (3 lignes):");
  console.log(`   const client = new VapiClient({ token: apiKey });
   const assistant = await client.assistants.get(id);
   return assistant; // Types complets + gestion d'erreurs automatique`);
}

// ===== EXÉCUTION DE LA DÉMONSTRATION =====

async function runDemo() {
  try {
    // Comparaisons pratiques
    await listAssistantsManual();
    await listAssistantsSDK();

    // Fonctionnalités avancées
    await demonstrateErrorHandling();
    await demonstrateAdvancedConfig();

    // Comparaisons théoriques
    demonstrateTypes();
    demonstrateCodeComparison();

    console.log("\n🎉 CONCLUSION : AVANTAGES DU SDK");
    console.log("================================");
    console.log("🚀 AVANTAGES MAJEURS:");
    console.log("   📝 Code: 80% moins de lignes");
    console.log("   🎯 Types: Validation TypeScript complète");
    console.log("   🛡️ Erreurs: Gestion automatique + types spécifiques");
    console.log("   🔄 Retry: Automatique avec backoff exponentiel");
    console.log("   ⏱️ Timeout: Configurable globalement et par requête");
    console.log("   🚀 DX: Expérience développeur supérieure");
    console.log("   📚 Maintenance: Moins de code = moins de bugs");

    console.log("\n💡 RECOMMANDATIONS:");
    console.log("   ✅ Pour nouveaux projets Vapi: Utiliser le SDK");
    console.log("   🤔 Pour MCP Allokoli: Évaluer migration progressive");
    console.log("   🎯 Avantages: Robustesse + Productivité");
    console.log("   ⚠️ Inconvénients: Dépendance + Moins de contrôle");

    console.log("\n🔮 POUR MCP ALLOKOLI:");
    console.log("   🎯 Notre approche manuelle reste valide");
    console.log("   ✅ Contrôle total adapté aux besoins MCP");
    console.log("   🚀 SDK recommandé pour futurs projets client");
  } catch (error) {
    console.error("❌ Erreur lors de la démonstration:", error.message);
  }
}

// Exécuter la démonstration
runDemo();
