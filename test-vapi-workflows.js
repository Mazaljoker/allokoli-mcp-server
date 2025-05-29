#!/usr/bin/env node

/**
 * Script de test pour les Workflows Vapi
 * Teste les 5 endpoints : list, create, get, update, delete
 */

import fetch from "node-fetch";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Charger les variables d'environnement depuis le fichier .env du répertoire parent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, "../.env") });

// Configuration
const vapiApiKey = process.env.VAPI_API_KEY;

if (!vapiApiKey) {
  console.error(
    "❌ VAPI_API_KEY non définie dans les variables d'environnement"
  );
  process.exit(1);
}

console.log("🚀 Test des Workflows Vapi");
console.log("==========================");

/**
 * Test de listVapiWorkflows
 */
async function testListVapiWorkflows() {
  console.log("\n🔍 Test: listVapiWorkflows");

  const response = await fetch("https://api.vapi.ai/workflow?limit=10", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${vapiApiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur lors de la récupération des workflows: ${error}`);
  }

  const workflows = await response.json();
  console.log(`✅ ${workflows.length} workflow(s) trouvé(s)`);

  if (workflows.length > 0) {
    console.log("📋 Premier workflow:");
    console.log(`   - ID: ${workflows[0].id}`);
    console.log(`   - Nom: ${workflows[0].name}`);
    console.log(`   - Nœuds: ${workflows[0].nodes?.length || 0}`);
    console.log(`   - Arêtes: ${workflows[0].edges?.length || 0}`);
  }

  return workflows;
}

/**
 * Test de createVapiWorkflow
 */
async function testCreateVapiWorkflow() {
  console.log("\n🔍 Test: createVapiWorkflow");

  // Configuration d'un workflow simple avec structure minimale
  const workflowConfig = {
    name: "Workflow Test Allokoli",
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

  const response = await fetch("https://api.vapi.ai/workflow", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${vapiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(workflowConfig),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur lors de la création du workflow: ${error}`);
  }

  const newWorkflow = await response.json();
  console.log("✅ Workflow créé avec succès");
  console.log(`   - ID: ${newWorkflow.id}`);
  console.log(`   - Nom: ${newWorkflow.name}`);
  console.log(`   - Nœuds: ${newWorkflow.nodes?.length || 0}`);
  console.log(`   - Arêtes: ${newWorkflow.edges?.length || 0}`);

  return newWorkflow;
}

/**
 * Test de getVapiWorkflow
 */
async function testGetVapiWorkflow(workflowId) {
  console.log(`\n🔍 Test: getVapiWorkflow (ID: ${workflowId})`);

  const response = await fetch(`https://api.vapi.ai/workflow/${workflowId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${vapiApiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur lors de la récupération du workflow: ${error}`);
  }

  const workflow = await response.json();
  console.log("✅ Workflow récupéré avec succès");
  console.log(`   - ID: ${workflow.id}`);
  console.log(`   - Nom: ${workflow.name}`);
  console.log(`   - Créé le: ${new Date(workflow.createdAt).toLocaleString()}`);
  console.log(
    `   - Mis à jour le: ${new Date(workflow.updatedAt).toLocaleString()}`
  );
  console.log(`   - Nœuds: ${workflow.nodes?.length || 0}`);
  console.log(`   - Arêtes: ${workflow.edges?.length || 0}`);

  return workflow;
}

/**
 * Test de updateVapiWorkflow
 */
async function testUpdateVapiWorkflow(workflowId) {
  console.log(`\n🔍 Test: updateVapiWorkflow (ID: ${workflowId})`);

  // D'abord, récupérer le workflow existant
  const getResponse = await fetch(
    `https://api.vapi.ai/workflow/${workflowId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${vapiApiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!getResponse.ok) {
    const error = await getResponse.text();
    throw new Error(`Erreur lors de la récupération du workflow: ${error}`);
  }

  const existingWorkflow = await getResponse.json();

  const updates = {
    name: "Workflow Test Allokoli - Mis à jour",
    nodes: existingWorkflow.nodes.map((node, index) => {
      if (index === 0) {
        return {
          ...node,
          prompt:
            "Bonjour ! Je suis l'assistant Allokoli mis à jour. Comment puis-je vous aider ?",
        };
      }
      return node;
    }),
    edges: existingWorkflow.edges,
    model: {
      provider: "openai",
      model: "gpt-3.5-turbo",
      maxTokens: 250,
      temperature: 0.8,
    },
  };

  const response = await fetch(`https://api.vapi.ai/workflow/${workflowId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${vapiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur lors de la mise à jour du workflow: ${error}`);
  }

  const updatedWorkflow = await response.json();
  console.log("✅ Workflow mis à jour avec succès");
  console.log(`   - Nouveau nom: ${updatedWorkflow.name}`);
  console.log(`   - Nouveau maxTokens: ${updatedWorkflow.model?.maxTokens}`);
  console.log(
    `   - Nouvelle température: ${updatedWorkflow.model?.temperature}`
  );

  return updatedWorkflow;
}

/**
 * Test de deleteVapiWorkflow
 */
async function testDeleteVapiWorkflow(workflowId) {
  console.log(`\n🔍 Test: deleteVapiWorkflow (ID: ${workflowId})`);

  const response = await fetch(`https://api.vapi.ai/workflow/${workflowId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${vapiApiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur lors de la suppression du workflow: ${error}`);
  }

  console.log("✅ Workflow supprimé avec succès");

  // Vérifier que le workflow n'existe plus
  try {
    const verifyResponse = await fetch(
      `https://api.vapi.ai/workflow/${workflowId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${vapiApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (verifyResponse.status === 404) {
      console.log("✅ Vérification: le workflow n'existe plus");
    } else {
      console.log("⚠️  Attention: le workflow semble encore exister");
    }
  } catch (error) {
    console.log("✅ Vérification: le workflow n'existe plus (erreur attendue)");
  }

  return { success: true };
}

/**
 * Fonction principale de test
 */
async function runTests() {
  try {
    // Test 1: Lister les workflows existants
    const existingWorkflows = await testListVapiWorkflows();

    // Test 2: Créer un nouveau workflow
    const newWorkflow = await testCreateVapiWorkflow();

    // Test 3: Récupérer le workflow créé
    await testGetVapiWorkflow(newWorkflow.id);

    // Test 4: Mettre à jour le workflow
    await testUpdateVapiWorkflow(newWorkflow.id);

    // Test 5: Supprimer le workflow
    await testDeleteVapiWorkflow(newWorkflow.id);

    console.log("\n🎉 Tous les tests des Workflows ont réussi !");
    console.log("✅ listVapiWorkflows: OK");
    console.log("✅ createVapiWorkflow: OK");
    console.log("✅ getVapiWorkflow: OK");
    console.log("✅ updateVapiWorkflow: OK");
    console.log("✅ deleteVapiWorkflow: OK");
  } catch (error) {
    console.error("\n❌ Erreur lors des tests:", error.message);
    process.exit(1);
  }
}

// Exécuter les tests
runTests();
