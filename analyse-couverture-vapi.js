#!/usr/bin/env node

console.log("🔍 Analyse de la couverture API Vapi");
console.log("===================================");

// Endpoints Vapi disponibles selon la documentation
const endpointsVapiDisponibles = {
  Calls: [
    "GET /call - List Calls",
    "POST /call - Create Call",
    "GET /call/:id - Get Call",
    "DELETE /call/:id - Delete Call Data",
    "PATCH /call/:id - Update Call",
  ],
  Assistants: [
    "GET /assistant - List Assistants",
    "POST /assistant - Create Assistant",
    "GET /assistant/:id - Get Assistant",
    "DELETE /assistant/:id - Delete Assistant",
    "PATCH /assistant/:id - Update Assistant",
  ],
  "Phone Numbers": [
    "GET /phone-number - List Phone Numbers",
    "POST /phone-number - Create Phone Number",
    "GET /phone-number/:id - Get Phone Number",
    "DELETE /phone-number/:id - Delete Phone Number",
    "PATCH /phone-number/:id - Update Phone Number",
  ],
  Tools: [
    "GET /tool - List Tools",
    "POST /tool - Create Tool",
    "GET /tool/:id - Get Tool",
    "DELETE /tool/:id - Delete Tool",
    "PATCH /tool/:id - Update Tool",
  ],
  Files: [
    "GET /file - List Files",
    "POST /file - Upload File",
    "GET /file/:id - Get File",
    "DELETE /file/:id - Delete File",
    "PATCH /file/:id - Update File",
  ],
  "Knowledge Bases": [
    "GET /knowledge-base - List Knowledge Bases",
    "POST /knowledge-base - Create Knowledge Base",
    "GET /knowledge-base/:id - Get Knowledge Base",
    "DELETE /knowledge-base/:id - Delete Knowledge Base",
    "PATCH /knowledge-base/:id - Update Knowledge Base",
  ],
  Workflows: [
    "GET /workflow - Get Workflows [BETA]",
    "POST /workflow - Create Workflow [BETA]",
    "GET /workflow/:id - Get Workflow [BETA]",
    "DELETE /workflow/:id - Delete Workflow [BETA]",
    "PATCH /workflow/:id - Update Workflow [BETA]",
  ],
  Squads: [
    "GET /squad - List Squads",
    "POST /squad - Create Squad",
    "GET /squad/:id - Get Squad",
    "DELETE /squad/:id - Delete Squad",
    "PATCH /squad/:id - Update Squad",
  ],
  "Test Suites": [
    "GET /test-suite - List Test Suites",
    "POST /test-suite - Create Test Suite",
    "GET /test-suite/:id - Get Test Suite",
    "DELETE /test-suite/:id - Delete Test Suite",
    "PATCH /test-suite/:id - Update Test Suite",
  ],
  "Test Suite Tests": [
    "GET /test - List Tests",
    "POST /test - Create Test",
    "GET /test/:id - Get Test",
    "DELETE /test/:id - Delete Test",
    "PATCH /test/:id - Update Test",
  ],
  "Test Suite Runs": [
    "GET /test-suite-run - List Test Suite Runs",
    "POST /test-suite-run - Create Test Suite Run",
    "GET /test-suite-run/:id - Get Test Suite Run",
    "DELETE /test-suite-run/:id - Delete Test Suite Run",
    "PATCH /test-suite-run/:id - Update Test Suite Run",
  ],
  Analytics: ["POST /analytics - Create Analytics Queries"],
  Logs: ["GET /logs - Get Logs", "DELETE /logs - Delete Logs"],
  Webhooks: [
    "POST /webhook/server - Server Message",
    "POST /webhook/client - Client Message",
  ],
};

// Endpoints actuellement implémentés dans le serveur MCP
const endpointsImplementes = [
  "listVapiAssistants - GET /assistant",
  "getVapiAssistant - GET /assistant/:id",
  "updateVapiAssistant - PATCH /assistant/:id",
  "deleteVapiAssistant - DELETE /assistant/:id",
  "listVapiCalls - GET /call",
  "createVapiCall - POST /call",
  "listVapiPhoneNumbers - GET /phone-number",
  "createVapiAssistant - POST /assistant (dans createAssistantAndProvisionNumber)",
];

console.log("\n✅ **Endpoints actuellement implémentés :**");
endpointsImplementes.forEach((endpoint) => {
  console.log(`   - ${endpoint}`);
});

console.log("\n❌ **Endpoints manquants par catégorie :**");

let totalDisponibles = 0;
let totalImplementes = endpointsImplementes.length;

Object.entries(endpointsVapiDisponibles).forEach(([categorie, endpoints]) => {
  totalDisponibles += endpoints.length;

  const manquants = endpoints.filter((endpoint) => {
    const method = endpoint.split(" ")[0];
    const path = endpoint.split(" ")[1];

    // Vérifier si cet endpoint est implémenté
    return !endpointsImplementes.some((impl) => {
      if (path.includes("/assistant") && impl.includes("Assistant"))
        return true;
      if (path.includes("/call") && impl.includes("Call")) return true;
      if (path.includes("/phone-number") && impl.includes("PhoneNumber"))
        return true;
      return false;
    });
  });

  if (manquants.length > 0) {
    console.log(
      `\n📂 **${categorie}** (${manquants.length}/${endpoints.length} manquants):`
    );
    manquants.forEach((endpoint) => {
      console.log(`   ❌ ${endpoint}`);
    });
  } else {
    console.log(`\n📂 **${categorie}** ✅ Tous implémentés`);
  }
});

console.log("\n📊 **Statistiques de couverture :**");
console.log(`   - Total endpoints Vapi disponibles: ${totalDisponibles}`);
console.log(`   - Total endpoints implémentés: ${totalImplementes}`);
console.log(
  `   - Pourcentage de couverture: ${Math.round(
    (totalImplementes / totalDisponibles) * 100
  )}%`
);

console.log("\n🎯 **Priorités d'implémentation recommandées :**");
console.log("   1. 🔧 Tools (création et gestion d'outils)");
console.log("   2. 📁 Files (upload et gestion de fichiers)");
console.log("   3. 🧠 Knowledge Bases (bases de connaissances)");
console.log("   4. 👥 Squads (équipes d'assistants)");
console.log("   5. 🧪 Test Suites (tests automatisés)");
console.log("   6. 📊 Analytics (analyses et métriques)");
console.log("   7. 📝 Logs (journalisation)");

console.log("\n💡 **Recommandations :**");
console.log(
  "   - Le serveur MCP couvre les fonctionnalités de base (Assistants, Calls, Phone Numbers)"
);
console.log(
  "   - Pour une couverture complète, ajouter les endpoints manquants par ordre de priorité"
);
console.log(
  "   - Les Tools et Knowledge Bases sont essentiels pour des assistants avancés"
);
console.log(
  "   - Les Test Suites permettront d'automatiser la validation des assistants"
);
