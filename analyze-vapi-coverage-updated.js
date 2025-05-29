#!/usr/bin/env node

console.log("📊 Analyse de la couverture API Vapi - Mise à jour");
console.log("=================================================");

// Endpoints Vapi disponibles (basé sur la documentation officielle)
const vapiEndpoints = {
  Calls: [
    "GET /call - List Calls",
    "POST /call - Create Call",
    "GET /call/{id} - Get Call",
    "DELETE /call/{id} - Delete Call Data",
    "PATCH /call/{id} - Update Call",
  ],
  Assistants: [
    "GET /assistant - List Assistants",
    "POST /assistant - Create Assistant",
    "GET /assistant/{id} - Get Assistant",
    "DELETE /assistant/{id} - Delete Assistant",
    "PATCH /assistant/{id} - Update Assistant",
  ],
  "Phone Numbers": [
    "GET /phone-number - List Phone Numbers",
    "POST /phone-number - Create Phone Number",
    "GET /phone-number/{id} - Get Phone Number",
    "DELETE /phone-number/{id} - Delete Phone Number",
    "PATCH /phone-number/{id} - Update Phone Number",
  ],
  Tools: [
    "GET /tool - List Tools",
    "POST /tool - Create Tool",
    "GET /tool/{id} - Get Tool",
    "DELETE /tool/{id} - Delete Tool",
    "PATCH /tool/{id} - Update Tool",
  ],
  Files: [
    "GET /file - List Files",
    "POST /file - Upload File",
    "GET /file/{id} - Get File",
    "DELETE /file/{id} - Delete File",
    "PATCH /file/{id} - Update File",
  ],
  "Knowledge Bases": [
    "GET /knowledge-base - List Knowledge Bases",
    "POST /knowledge-base - Create Knowledge Base",
    "GET /knowledge-base/{id} - Get Knowledge Base",
    "DELETE /knowledge-base/{id} - Delete Knowledge Base",
    "PATCH /knowledge-base/{id} - Update Knowledge Base",
  ],
  Workflows: [
    "GET /workflow - Get Workflows",
    "POST /workflow - Create Workflow",
    "GET /workflow/{id} - Get Workflow",
    "DELETE /workflow/{id} - Delete Workflow",
    "PATCH /workflow/{id} - Update Workflow",
  ],
  Squads: [
    "GET /squad - List Squads",
    "POST /squad - Create Squad",
    "GET /squad/{id} - Get Squad",
    "DELETE /squad/{id} - Delete Squad",
    "PATCH /squad/{id} - Update Squad",
  ],
  "Test Suites": [
    "GET /test-suite - List Test Suites",
    "POST /test-suite - Create Test Suite",
    "GET /test-suite/{id} - Get Test Suite",
    "DELETE /test-suite/{id} - Delete Test Suite",
    "PATCH /test-suite/{id} - Update Test Suite",
  ],
  "Test Suite Tests": [
    "GET /test-suite/{id}/test - List Tests",
    "POST /test-suite/{id}/test - Create Test",
    "GET /test-suite/{id}/test/{testId} - Get Test",
    "DELETE /test-suite/{id}/test/{testId} - Delete Test",
    "PATCH /test-suite/{id}/test/{testId} - Update Test",
  ],
  "Test Suite Runs": [
    "GET /test-suite-run - List Test Suite Runs",
    "POST /test-suite-run - Create Test Suite Run",
    "GET /test-suite-run/{id} - Get Test Suite Run",
    "DELETE /test-suite-run/{id} - Delete Test Suite Run",
    "PATCH /test-suite-run/{id} - Update Test Suite Run",
  ],
  Analytics: ["POST /analytics - Create Analytics Queries"],
  Logs: ["GET /log - Get Logs", "DELETE /log - Delete Logs"],
  Webhooks: [
    "POST /webhook/server - Server Message",
    "POST /webhook/client - Client Message",
  ],
};

// Endpoints implémentés dans notre serveur MCP
const implementedEndpoints = {
  Assistants: [
    "✅ GET /assistant - listVapiAssistants",
    "✅ GET /assistant/{id} - getVapiAssistant",
    "✅ PATCH /assistant/{id} - updateVapiAssistant",
    "✅ DELETE /assistant/{id} - deleteVapiAssistant",
  ],
  Calls: ["✅ GET /call - listVapiCalls", "✅ POST /call - createVapiCall"],
  "Phone Numbers": ["✅ GET /phone-number - listVapiPhoneNumbers"],
  Tools: [
    "✅ GET /tool - listVapiTools",
    "✅ POST /tool - createVapiTool",
    "✅ GET /tool/{id} - getVapiTool",
    "✅ PATCH /tool/{id} - updateVapiTool",
    "✅ DELETE /tool/{id} - deleteVapiTool",
  ],
  "Knowledge Bases": [
    "✅ GET /knowledge-base - listVapiKnowledgeBases",
    "✅ POST /knowledge-base - createVapiKnowledgeBase",
    "✅ GET /knowledge-base/{id} - getVapiKnowledgeBase",
    "✅ PATCH /knowledge-base/{id} - updateVapiKnowledgeBase",
    "✅ DELETE /knowledge-base/{id} - deleteVapiKnowledgeBase",
  ],
  "Allokoli Custom": [
    "✅ createAssistantAndProvisionNumber",
    "✅ provisionPhoneNumber",
    "✅ listAssistants",
    "✅ getAssistant",
    "✅ updateAssistant",
  ],
};

// Calcul des statistiques
let totalEndpoints = 0;
let implementedCount = 0;

Object.values(vapiEndpoints).forEach((endpoints) => {
  totalEndpoints += endpoints.length;
});

Object.values(implementedEndpoints).forEach((endpoints) => {
  implementedCount += endpoints.length;
});

// Ajustement pour ne pas compter les endpoints Allokoli custom dans le total Vapi
const allokoliCustomCount = implementedEndpoints["Allokoli Custom"].length;
const vapiImplementedCount = implementedCount - allokoliCustomCount;

const coveragePercentage = Math.round(
  (vapiImplementedCount / totalEndpoints) * 100
);

console.log("\n🎯 STATISTIQUES DE COUVERTURE");
console.log("==============================");
console.log(`📊 Total endpoints Vapi disponibles: ${totalEndpoints}`);
console.log(`✅ Endpoints Vapi implémentés: ${vapiImplementedCount}`);
console.log(`🔧 Endpoints Allokoli custom: ${allokoliCustomCount}`);
console.log(`📈 Couverture API Vapi: ${coveragePercentage}%`);

console.log("\n🏆 PROGRESSION PAR CATÉGORIE");
console.log("=============================");

Object.keys(vapiEndpoints).forEach((category) => {
  const available = vapiEndpoints[category].length;
  const implemented = implementedEndpoints[category]
    ? implementedEndpoints[category].length
    : 0;
  const categoryPercentage = Math.round((implemented / available) * 100);

  const status =
    implemented === available
      ? "🟢 COMPLET"
      : implemented > 0
      ? "🟡 PARTIEL"
      : "🔴 NON IMPLÉMENTÉ";

  console.log(
    `${status} ${category}: ${implemented}/${available} (${categoryPercentage}%)`
  );
});

console.log("\n📋 DÉTAIL DES IMPLÉMENTATIONS");
console.log("==============================");

Object.keys(implementedEndpoints).forEach((category) => {
  console.log(`\n📁 ${category}:`);
  implementedEndpoints[category].forEach((endpoint) => {
    console.log(`   ${endpoint}`);
  });
});

console.log("\n🎯 PROCHAINES PRIORITÉS RECOMMANDÉES");
console.log("=====================================");

const priorities = [
  {
    category: "Files",
    reason: "Gestion des fichiers pour enrichir les Knowledge Bases",
    endpoints: ["GET /file", "POST /file", "DELETE /file"],
  },
  {
    category: "Squads",
    reason: "Équipes d'assistants pour des conversations complexes",
    endpoints: ["GET /squad", "POST /squad", "GET /squad/{id}"],
  },
  {
    category: "Test Suites",
    reason: "Tests automatisés pour valider les assistants",
    endpoints: ["GET /test-suite", "POST /test-suite", "POST /test-suite-run"],
  },
  {
    category: "Workflows",
    reason: "Flux de travail avancés pour les assistants",
    endpoints: ["GET /workflow", "POST /workflow"],
  },
];

priorities.forEach((priority, index) => {
  console.log(`\n${index + 1}. 🎯 ${priority.category}`);
  console.log(`   💡 ${priority.reason}`);
  console.log(`   📝 Endpoints clés: ${priority.endpoints.join(", ")}`);
});

console.log("\n🚀 RÉSUMÉ DE L'ÉVOLUTION");
console.log("========================");
console.log("✅ Étape 1 TERMINÉE: Assistants de base (4 endpoints)");
console.log("✅ Étape 2 TERMINÉE: Appels et numéros (3 endpoints)");
console.log("✅ Étape 3 TERMINÉE: Tools (5 endpoints)");
console.log("✅ Étape 4 TERMINÉE: Knowledge Bases (5 endpoints)");
console.log("🎯 Étape 5 SUIVANTE: Files (5 endpoints)");
console.log("🎯 Étape 6 FUTURE: Squads (5 endpoints)");

console.log(`\n🎉 COUVERTURE ACTUELLE: ${coveragePercentage}% de l'API Vapi`);
console.log(
  "🔥 Le serveur MCP Allokoli couvre maintenant les fonctionnalités essentielles !"
);
