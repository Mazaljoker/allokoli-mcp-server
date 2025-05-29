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

console.log("🎯 Test des fonctionnalités Squads Vapi");
console.log("======================================");

/**
 * Test de listVapiSquads
 */
async function testListVapiSquads() {
  console.log("\n🔍 Test: listVapiSquads");

  const response = await fetch("https://api.vapi.ai/squad?limit=10", {
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

  const squads = await response.json();
  console.log(`✅ ${squads.length} squads récupérés`);

  if (squads.length > 0) {
    console.log("🎯 Premier squad:");
    console.log(`   - ID: ${squads[0].id}`);
    console.log(`   - Nom: ${squads[0].name || "Sans nom"}`);
    console.log(`   - Membres: ${squads[0].members?.length || 0} assistants`);
    console.log(`   - Créé le: ${squads[0].createdAt || "Non défini"}`);
    console.log(`   - Modifié le: ${squads[0].updatedAt || "Non défini"}`);

    if (squads[0].members && squads[0].members.length > 0) {
      console.log("   - Premier membre:");
      const member = squads[0].members[0];
      console.log(`     * Assistant ID: ${member.assistantId || "Non défini"}`);
      if (member.assistantOverrides) {
        console.log(
          `     * Surcharges: ${JSON.stringify(member.assistantOverrides)}`
        );
      }
      if (member.assistantDestinations) {
        console.log(
          `     * Destinations: ${member.assistantDestinations.length} disponibles`
        );
      }
    }

    if (squads[0].membersOverrides) {
      console.log(
        `   - Surcharges globales: ${JSON.stringify(
          squads[0].membersOverrides
        )}`
      );
    }
  }

  return squads;
}

/**
 * Test de createVapiSquad
 */
async function testCreateVapiSquad() {
  console.log("\n🔍 Test: createVapiSquad");

  // D'abord, récupérons les assistants disponibles pour créer un squad
  const assistantsResponse = await fetch(
    "https://api.vapi.ai/assistant?limit=5",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${vapiApiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!assistantsResponse.ok) {
    throw new Error(
      "Impossible de récupérer les assistants pour créer un squad"
    );
  }

  const assistants = await assistantsResponse.json();

  if (assistants.length < 2) {
    console.log(
      "⚠️ Pas assez d'assistants disponibles pour créer un squad (minimum 2)"
    );
    console.log("   Création d'un squad avec un seul membre pour le test...");
  }

  const squadConfig = {
    name: "Squad Test Allokoli",
    members: assistants
      .slice(0, Math.min(2, assistants.length))
      .map((assistant, index) => ({
        assistantId: assistant.id,
        assistantOverrides: {
          firstMessage: `Bonjour, je suis l'assistant ${
            index + 1
          } du squad Allokoli !`,
          voice: {
            provider: "11labs",
            voiceId:
              index === 0 ? "21m00Tcm4TlvDq8ikWAM" : "AZnzlk1XvdvUeBnXmlld",
          },
        },
        assistantDestinations:
          index === 0
            ? [
                {
                  type: "assistant",
                  assistantName: "Assistant Spécialisé",
                  message: "Je vous transfère vers notre assistant spécialisé.",
                  description:
                    "Transfert vers l'assistant spécialisé pour les demandes complexes",
                },
              ]
            : undefined,
      })),
    membersOverrides: {
      voice: {
        provider: "11labs",
        voiceId: "21m00Tcm4TlvDq8ikWAM",
      },
      firstMessage: "Bienvenue dans notre équipe d'assistants Allokoli !",
      silenceTimeoutSeconds: 30,
      maxDurationSeconds: 600,
    },
  };

  const response = await fetch("https://api.vapi.ai/squad", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${vapiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(squadConfig),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur Vapi: ${error}`);
  }

  const squad = await response.json();
  console.log("✅ Squad créé avec succès:");
  console.log(`   - ID: ${squad.id}`);
  console.log(`   - Nom: ${squad.name}`);
  console.log(`   - Membres: ${squad.members?.length || 0} assistants`);
  console.log(`   - Créé le: ${squad.createdAt}`);

  return squad;
}

/**
 * Test de getVapiSquad
 */
async function testGetVapiSquad(squadId) {
  console.log(`\n🔍 Test: getVapiSquad (ID: ${squadId})`);

  const response = await fetch(`https://api.vapi.ai/squad/${squadId}`, {
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

  const squad = await response.json();
  console.log("✅ Squad récupéré:");
  console.log(`   - Nom: ${squad.name || "Non défini"}`);
  console.log(`   - Membres: ${squad.members?.length || 0} assistants`);
  console.log(`   - Créé le: ${squad.createdAt || "Non défini"}`);
  console.log(`   - Modifié le: ${squad.updatedAt || "Non défini"}`);

  if (squad.members && squad.members.length > 0) {
    console.log("   - Détails des membres:");
    squad.members.forEach((member, index) => {
      console.log(`     ${index + 1}. Assistant ID: ${member.assistantId}`);
      if (member.assistantOverrides?.firstMessage) {
        console.log(
          `        Message: "${member.assistantOverrides.firstMessage}"`
        );
      }
      if (member.assistantOverrides?.voice) {
        console.log(
          `        Voix: ${member.assistantOverrides.voice.provider}/${member.assistantOverrides.voice.voiceId}`
        );
      }
    });
  }

  if (squad.membersOverrides) {
    console.log("   - Surcharges globales:");
    if (squad.membersOverrides.firstMessage) {
      console.log(
        `     * Message global: "${squad.membersOverrides.firstMessage}"`
      );
    }
    if (squad.membersOverrides.voice) {
      console.log(
        `     * Voix globale: ${squad.membersOverrides.voice.provider}/${squad.membersOverrides.voice.voiceId}`
      );
    }
    if (squad.membersOverrides.silenceTimeoutSeconds) {
      console.log(
        `     * Timeout silence: ${squad.membersOverrides.silenceTimeoutSeconds}s`
      );
    }
    if (squad.membersOverrides.maxDurationSeconds) {
      console.log(
        `     * Durée max: ${squad.membersOverrides.maxDurationSeconds}s`
      );
    }
  }

  return squad;
}

/**
 * Test de updateVapiSquad
 */
async function testUpdateVapiSquad(squadId) {
  console.log(`\n🔍 Test: updateVapiSquad (ID: ${squadId})`);

  // D'abord, récupérer le squad existant pour obtenir ses membres
  const getResponse = await fetch(`https://api.vapi.ai/squad/${squadId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${vapiApiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!getResponse.ok) {
    const error = await getResponse.text();
    throw new Error(`Erreur lors de la récupération du squad: ${error}`);
  }

  const existingSquad = await getResponse.json();

  const updates = {
    name: "Squad Test Allokoli - Mis à jour",
    members: existingSquad.members, // Inclure les membres existants
    membersOverrides: {
      voice: {
        provider: "11labs",
        voiceId: "EXAVITQu4vr4xnSDxMaL",
      },
      firstMessage: "Bonjour ! Notre équipe Allokoli a été mise à jour !",
      silenceTimeoutSeconds: 45,
      maxDurationSeconds: 900,
    },
  };

  const response = await fetch(`https://api.vapi.ai/squad/${squadId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${vapiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur Vapi: ${error}`);
  }

  const squad = await response.json();
  console.log("✅ Squad mis à jour:");
  console.log(`   - Nom: ${squad.name}`);
  console.log(`   - Modifié le: ${squad.updatedAt}`);

  if (squad.membersOverrides) {
    console.log("   - Nouvelles surcharges:");
    console.log(`     * Message: "${squad.membersOverrides.firstMessage}"`);
    console.log(
      `     * Voix: ${squad.membersOverrides.voice?.provider}/${squad.membersOverrides.voice?.voiceId}`
    );
    console.log(
      `     * Timeout: ${squad.membersOverrides.silenceTimeoutSeconds}s`
    );
    console.log(
      `     * Durée max: ${squad.membersOverrides.maxDurationSeconds}s`
    );
  }

  return squad;
}

/**
 * Test de deleteVapiSquad
 */
async function testDeleteVapiSquad(squadId) {
  console.log(`\n🔍 Test: deleteVapiSquad (ID: ${squadId})`);

  const response = await fetch(`https://api.vapi.ai/squad/${squadId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${vapiApiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur Vapi: ${error}`);
  }

  console.log("✅ Squad supprimé avec succès");
  return { success: true };
}

/**
 * Exécuter tous les tests Squads
 */
async function runSquadsTests() {
  try {
    console.log("🚀 Démarrage des tests Squads...\n");

    // Test 1: Lister les squads existants
    const existingSquads = await testListVapiSquads();

    // Test 2: Créer un nouveau squad
    const newSquad = await testCreateVapiSquad();

    // Test 3: Récupérer le squad créé
    await testGetVapiSquad(newSquad.id);

    // Test 4: Mettre à jour le squad
    await testUpdateVapiSquad(newSquad.id);

    // Test 5: Supprimer le squad de test
    await testDeleteVapiSquad(newSquad.id);

    console.log("\n🎉 Tous les tests Squads sont passés avec succès !");
    console.log("\n📊 Résumé:");
    console.log(`   - ${existingSquads.length} squads existants`);
    console.log("   - Création de squad: ✅");
    console.log("   - Récupération de squad: ✅");
    console.log("   - Mise à jour de squad: ✅");
    console.log("   - Suppression de squad: ✅");
    console.log("   - API Squads Vapi entièrement fonctionnelle");

    console.log("\n💡 Les Squads permettent de créer des équipes d'assistants");
    console.log("   qui peuvent collaborer dans une même conversation !");
  } catch (error) {
    console.error("\n❌ Erreur lors des tests Squads:", error.message);
    process.exit(1);
  }
}

runSquadsTests();
