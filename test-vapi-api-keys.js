#!/usr/bin/env node

import dotenv from "dotenv";
import fetch from "node-fetch";

// Charger les variables d'environnement depuis le répertoire parent
dotenv.config({ path: "../.env" });

const vapiApiKey = process.env.VAPI_API_KEY;

console.log("🔍 Test des clés API Vapi");
console.log("========================");

if (!vapiApiKey) {
  console.error("❌ VAPI_API_KEY non définie dans .env");
  process.exit(1);
}

console.log("✅ VAPI_API_KEY trouvée:", vapiApiKey.substring(0, 10) + "...");

// Test de l'API Vapi
async function testVapiAPI() {
  try {
    console.log("\n🧪 Test de l'API Vapi...");

    const response = await fetch("https://api.vapi.ai/assistant?limit=5", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${vapiApiKey}`,
        "Content-Type": "application/json",
      },
    });

    console.log("📡 Status:", response.status);
    console.log("📡 Status Text:", response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ API Vapi fonctionne !");
      console.log("📊 Nombre d'assistants:", data.length || 0);

      if (data.length > 0) {
        console.log("🤖 Premier assistant:", data[0].name || data[0].id);
      }
    } else {
      const errorText = await response.text();
      console.error("❌ Erreur API Vapi:", errorText);
    }
  } catch (error) {
    console.error("❌ Erreur de connexion:", error.message);
  }
}

// Test de l'API Supabase
async function testSupabaseAPI() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("\n🧪 Test de l'API Supabase...");

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Variables Supabase manquantes");
    return;
  }

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/assistants?limit=5`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        apikey: supabaseKey,
      },
    });

    console.log("📡 Status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ API Supabase fonctionne !");
      console.log("📊 Nombre d'assistants:", data.length || 0);
    } else {
      const errorText = await response.text();
      console.error("❌ Erreur API Supabase:", errorText);
    }
  } catch (error) {
    console.error("❌ Erreur de connexion Supabase:", error.message);
  }
}

// Exécuter les tests
async function runTests() {
  await testVapiAPI();
  await testSupabaseAPI();

  console.log("\n🏁 Tests terminés");
}

runTests();
