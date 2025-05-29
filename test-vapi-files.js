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

console.log("📁 Test des fonctionnalités Files Vapi");
console.log("=====================================");

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
    console.log(`   - Taille: ${files[0].bytes || "Non définie"} bytes`);
    console.log(`   - Type MIME: ${files[0].mimetype || "Non défini"}`);
    console.log(`   - Statut: ${files[0].status || "Non défini"}`);
    console.log(`   - Objectif: ${files[0].purpose || "Non défini"}`);
  }

  return files;
}

/**
 * Test de uploadVapiFile (version simplifiée pour test)
 */
async function testUploadVapiFileSimple() {
  console.log("\n🔍 Test: uploadVapiFile (Simple)");

  // Contenu de test simple
  const fileContent = `# Guide d'utilisation Allokoli

## Introduction
Allokoli est un assistant vocal intelligent pour les entreprises.

## Fonctionnalités principales
- Prise de rendez-vous automatique
- Réservations en ligne
- Support client 24/7
- Transfert d'appels intelligent

## Configuration
1. Créer un assistant
2. Configurer les paramètres
3. Tester l'assistant
4. Déployer en production

## Support
Pour toute question, contactez support@allokoli.com
`;

  const fileConfig = {
    name: "guide-allokoli-test.md",
    purpose: "assistant",
    content: fileContent,
    mimetype: "text/markdown",
  };

  const response = await fetch("https://api.vapi.ai/file", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${vapiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fileConfig),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur Vapi: ${error}`);
  }

  const file = await response.json();
  console.log("✅ Fichier uploadé:");
  console.log(`   - ID: ${file.id}`);
  console.log(`   - Nom: ${file.name || "Non défini"}`);
  console.log(`   - Taille: ${file.bytes || "Non définie"} bytes`);
  console.log(`   - Type MIME: ${file.mimetype || "Non défini"}`);
  console.log(`   - Statut: ${file.status || "Non défini"}`);
  console.log(`   - URL: ${file.url || "Non définie"}`);

  return file;
}

/**
 * Test de getVapiFile
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
  console.log(`   - Taille: ${file.bytes || "Non définie"} bytes`);
  console.log(`   - Type MIME: ${file.mimetype || "Non défini"}`);
  console.log(`   - Statut: ${file.status || "Non défini"}`);
  console.log(`   - Créé le: ${file.createdAt || "Non défini"}`);
  console.log(`   - Modifié le: ${file.updatedAt || "Non défini"}`);

  if (file.parsedTextUrl) {
    console.log(`   - Texte parsé disponible: ${file.parsedTextUrl}`);
    console.log(
      `   - Taille texte parsé: ${file.parsedTextBytes || "Non définie"} bytes`
    );
  }

  return file;
}

/**
 * Test de updateVapiFile
 */
async function testUpdateVapiFile(fileId) {
  console.log(`\n🔍 Test: updateVapiFile (ID: ${fileId})`);

  const updates = {
    name: "guide-allokoli-test-updated.md",
    purpose: "knowledge-base",
    metadata: {
      version: "1.1",
      author: "Allokoli Team",
      category: "documentation",
    },
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
  console.log(`   - Métadonnées: ${JSON.stringify(file.metadata || {})}`);

  return file;
}

/**
 * Test de deleteVapiFile
 */
async function testDeleteVapiFile(fileId) {
  console.log(`\n🔍 Test: deleteVapiFile (ID: ${fileId})`);

  const response = await fetch(`https://api.vapi.ai/file/${fileId}`, {
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

  console.log("✅ Fichier supprimé avec succès");
  return { success: true };
}

/**
 * Exécuter tous les tests Files
 */
async function runFilesTests() {
  try {
    console.log("🚀 Démarrage des tests Files...\n");

    // Test 1: Lister les fichiers existants
    const existingFiles = await testListVapiFiles();

    // Test 2: Uploader un nouveau fichier
    const newFile = await testUploadVapiFileSimple();

    // Test 3: Récupérer le fichier uploadé
    await testGetVapiFile(newFile.id);

    // Test 4: Mettre à jour le fichier
    await testUpdateVapiFile(newFile.id);

    // Test 5: Supprimer le fichier de test
    await testDeleteVapiFile(newFile.id);

    console.log("\n🎉 Tous les tests Files sont passés avec succès !");
    console.log("\n📊 Résumé:");
    console.log(`   - ${existingFiles.length} fichiers existants`);
    console.log("   - Upload de fichier: ✅");
    console.log("   - Récupération de fichier: ✅");
    console.log("   - Mise à jour de fichier: ✅");
    console.log("   - Suppression de fichier: ✅");
    console.log("   - API Files Vapi entièrement fonctionnelle");
  } catch (error) {
    console.error("\n❌ Erreur lors des tests Files:", error.message);
    process.exit(1);
  }
}

runFilesTests();
