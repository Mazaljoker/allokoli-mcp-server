#!/usr/bin/env node

import dotenv from "dotenv";
import fetch from "node-fetch";

// Charger les variables d'environnement depuis le répertoire parent
dotenv.config({ path: "../.env" });

const vapiApiKey = process.env.VAPI_API_KEY;

console.log("🔍 Test direct de l'API Vapi");
console.log("============================");

if (!vapiApiKey) {
  console.error("❌ VAPI_API_KEY non définie dans .env");
  process.exit(1);
}

console.log("✅ VAPI_API_KEY trouvée:", vapiApiKey.substring(0, 10) + "...");

// Test complet de l'API Vapi
async function testVapiAPIComplete() {
  try {
    console.log("\n🧪 Test complet de l'API Vapi...");

    // 1. Lister les assistants
    console.log("\n📋 1. Liste des assistants:");
    const assistantsResponse = await fetch(
      "https://api.vapi.ai/assistant?limit=10",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${vapiApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!assistantsResponse.ok) {
      const error = await assistantsResponse.text();
      throw new Error(`Erreur liste assistants: ${error}`);
    }

    const assistants = await assistantsResponse.json();
    console.log(`✅ ${assistants.length} assistants trouvés`);

    if (assistants.length > 0) {
      console.log(
        "🤖 Premier assistant:",
        assistants[0].name || assistants[0].id
      );

      // 2. Récupérer un assistant spécifique
      const assistantId = assistants[0].id;
      console.log(`\n🔍 2. Détails de l'assistant ${assistantId}:`);

      const assistantResponse = await fetch(
        `https://api.vapi.ai/assistant/${assistantId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${vapiApiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (assistantResponse.ok) {
        const assistant = await assistantResponse.json();
        console.log("✅ Assistant récupéré:", assistant.name || assistant.id);
        console.log(
          "📝 Prompt système:",
          assistant.model?.messages?.[0]?.content?.substring(0, 100) + "..."
        );
      } else {
        console.log(
          "❌ Erreur récupération assistant:",
          await assistantResponse.text()
        );
      }
    }

    // 3. Lister les numéros de téléphone
    console.log("\n📞 3. Numéros de téléphone:");
    const phoneResponse = await fetch(
      "https://api.vapi.ai/phone-number?limit=10",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${vapiApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (phoneResponse.ok) {
      const phoneNumbers = await phoneResponse.json();
      console.log(`✅ ${phoneNumbers.length} numéros trouvés`);
      if (phoneNumbers.length > 0) {
        console.log("📱 Premier numéro:", phoneNumbers[0].number);
      }
    } else {
      console.log("❌ Erreur numéros:", await phoneResponse.text());
    }

    // 4. Lister les appels
    console.log("\n📞 4. Historique des appels:");
    const callsResponse = await fetch("https://api.vapi.ai/call?limit=5", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${vapiApiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (callsResponse.ok) {
      const calls = await callsResponse.json();
      console.log(`✅ ${calls.length} appels trouvés`);
      if (calls.length > 0) {
        console.log(
          "📞 Dernier appel:",
          calls[0].id,
          "- Status:",
          calls[0].status
        );
      }
    } else {
      console.log("❌ Erreur appels:", await callsResponse.text());
    }

    console.log("\n🎉 Test complet terminé avec succès !");
  } catch (error) {
    console.error("❌ Erreur:", error.message);
  }
}

testVapiAPIComplete();
