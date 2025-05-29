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

console.log("📁 Test simplifié des fonctionnalités Files Vapi");
console.log("===============================================");

/**
 * Test de listVapiFiles
 */
async function testListVapiFiles() {
  console.log("\n🔍 Test: listVapiFiles");

  const response = await fetch("https://api.vapi.ai/file?limit=10", {
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

  const files = await response.json();
  console.log(`✅ ${files.length} fichiers récupérés`);

  if (files.length > 0) {
    console.log("📁 Premier fichier:");
    console.log(`   - ID: ${files[0].id}`);
    console.log(`   - Nom: ${files[0].name || "Sans nom"}`);
    console.log(`   - Nom original: ${files[0].originalName || "Non défini"}`);
    console.log(`   - Taille: ${files[0].bytes || "Non définie"} bytes`);
    console.log(`   - Type MIME: ${files[0].mimetype || "Non défini"}`);
    console.log(`   - Statut: ${files[0].status || "Non défini"}`);
    console.log(`   - Objectif: ${files[0].purpose || "Non défini"}`);
    console.log(`   - Créé le: ${files[0].createdAt || "Non défini"}`);

    if (files[0].url) {
      console.log(`   - URL: ${files[0].url}`);
    }

    if (files[0].parsedTextUrl) {
      console.log(`   - Texte parsé disponible: ${files[0].parsedTextUrl}`);
      console.log(
        `   - Taille texte parsé: ${
          files[0].parsedTextBytes || "Non définie"
        } bytes`
      );
    }
  }

  return files;
}

/**
 * Test de getVapiFile (si des fichiers existent)
 */
async function testGetVapiFile(fileId) {
  console.log(`\n🔍 Test: getVapiFile (ID: ${fileId})`);

  const response = await fetch(`https://api.vapi.ai/file/${fileId}`, {
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

  const file = await response.json();
  console.log("✅ Fichier récupéré:");
  console.log(`   - Nom: ${file.name || "Non défini"}`);
  console.log(`   - Nom original: ${file.originalName || "Non défini"}`);
  console.log(`   - Taille: ${file.bytes || "Non définie"} bytes`);
  console.log(`   - Type MIME: ${file.mimetype || "Non défini"}`);
  console.log(`   - Statut: ${file.status || "Non défini"}`);
  console.log(`   - Objectif: ${file.purpose || "Non défini"}`);
  console.log(`   - Créé le: ${file.createdAt || "Non défini"}`);
  console.log(`   - Modifié le: ${file.updatedAt || "Non défini"}`);

  if (file.url) {
    console.log(`   - URL: ${file.url}`);
  }

  if (file.parsedTextUrl) {
    console.log(`   - Texte parsé disponible: ${file.parsedTextUrl}`);
    console.log(
      `   - Taille texte parsé: ${file.parsedTextBytes || "Non définie"} bytes`
    );
  }

  if (file.metadata && Object.keys(file.metadata).length > 0) {
    console.log(`   - Métadonnées: ${JSON.stringify(file.metadata)}`);
  }

  return file;
}

/**
 * Test de updateVapiFile (si des fichiers existent)
 */
async function testUpdateVapiFile(fileId) {
  console.log(`\n🔍 Test: updateVapiFile (ID: ${fileId})`);

  const updates = {
    name: "fichier-test-allokoli-updated",
  };

  const response = await fetch(`https://api.vapi.ai/file/${fileId}`, {
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

  const file = await response.json();
  console.log("✅ Fichier mis à jour:");
  console.log(`   - Nom: ${file.name || "Non défini"}`);
  console.log(`   - Objectif: ${file.purpose || "Non défini"}`);

  return file;
}

/**
 * Exécuter les tests Files simplifiés
 */
async function runSimpleFilesTests() {
  try {
    console.log("🚀 Démarrage des tests Files simplifiés...\n");

    // Test 1: Lister les fichiers existants
    const existingFiles = await testListVapiFiles();

    if (existingFiles.length > 0) {
      // Test 2: Récupérer le premier fichier
      await testGetVapiFile(existingFiles[0].id);

      // Test 3: Mettre à jour le premier fichier (puis le remettre comme avant)
      const originalFile = existingFiles[0];
      await testUpdateVapiFile(existingFiles[0].id);

      // Remettre les valeurs originales
      console.log("\n🔄 Remise en état du fichier...");
      const restoreUpdates = {
        name: originalFile.name,
      };

      await fetch(`https://api.vapi.ai/file/${existingFiles[0].id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${vapiApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(restoreUpdates),
      });
      console.log("✅ Fichier remis dans son état original");
    }

    console.log(
      "\n🎉 Tous les tests Files simplifiés sont passés avec succès !"
    );
    console.log("\n📊 Résumé:");
    console.log(`   - ${existingFiles.length} fichiers existants`);
    console.log("   - Listage de fichiers: ✅");

    if (existingFiles.length > 0) {
      console.log("   - Récupération de fichier: ✅");
      console.log("   - Mise à jour de fichier: ✅");
    } else {
      console.log("   - Aucun fichier existant pour tester get/update");
    }

    console.log("   - API Files Vapi fonctionnelle (lecture/mise à jour)");
    console.log(
      "\n💡 Note: L'upload de fichiers nécessite un vrai fichier multipart."
    );
    console.log(
      "   Pour tester l'upload, utilisez le dashboard Vapi ou curl avec -F file=@fichier"
    );
  } catch (error) {
    console.error("\n❌ Erreur lors des tests Files:", error.message);
    process.exit(1);
  }
}

runSimpleFilesTests();
