#!/usr/bin/env node

/**
 * Script d'analyse de la couverture API Vapi après implémentation des Test Suite Runs
 * Calcule la progression vers 100% de couverture
 */

console.log("🔍 ANALYSE DE COUVERTURE API VAPI - TEST SUITE RUNS");
console.log("==================================================");

// Définition complète de l'API Vapi avec tous les endpoints
const VAPI_API_ENDPOINTS = {
  // ===== ASSISTANTS (5/5) ✅ =====
  assistants: {
    total: 5,
    implemented: 5,
    endpoints: [
      { name: "GET /assistant", implemented: true, tool: "listVapiAssistants" },
      {
        name: "POST /assistant",
        implemented: true,
        tool: "createVapiAssistant",
      },
      {
        name: "GET /assistant/{id}",
        implemented: true,
        tool: "getVapiAssistant",
      },
      {
        name: "PATCH /assistant/{id}",
        implemented: true,
        tool: "updateVapiAssistant",
      },
      {
        name: "DELETE /assistant/{id}",
        implemented: true,
        tool: "deleteVapiAssistant",
      },
    ],
  },

  // ===== TOOLS (5/5) ✅ =====
  tools: {
    total: 5,
    implemented: 5,
    endpoints: [
      { name: "GET /tool", implemented: true, tool: "listVapiTools" },
      { name: "POST /tool", implemented: true, tool: "createVapiTool" },
      { name: "GET /tool/{id}", implemented: true, tool: "getVapiTool" },
      { name: "PATCH /tool/{id}", implemented: true, tool: "updateVapiTool" },
      { name: "DELETE /tool/{id}", implemented: true, tool: "deleteVapiTool" },
    ],
  },

  // ===== KNOWLEDGE BASES (5/5) ✅ =====
  knowledgeBases: {
    total: 5,
    implemented: 5,
    endpoints: [
      {
        name: "GET /knowledge-base",
        implemented: true,
        tool: "listVapiKnowledgeBases",
      },
      {
        name: "POST /knowledge-base",
        implemented: true,
        tool: "createVapiKnowledgeBase",
      },
      {
        name: "GET /knowledge-base/{id}",
        implemented: true,
        tool: "getVapiKnowledgeBase",
      },
      {
        name: "PATCH /knowledge-base/{id}",
        implemented: true,
        tool: "updateVapiKnowledgeBase",
      },
      {
        name: "DELETE /knowledge-base/{id}",
        implemented: true,
        tool: "deleteVapiKnowledgeBase",
      },
    ],
  },

  // ===== SQUADS (5/5) ✅ =====
  squads: {
    total: 5,
    implemented: 5,
    endpoints: [
      { name: "GET /squad", implemented: true, tool: "listVapiSquads" },
      { name: "POST /squad", implemented: true, tool: "createVapiSquad" },
      { name: "GET /squad/{id}", implemented: true, tool: "getVapiSquad" },
      { name: "PATCH /squad/{id}", implemented: true, tool: "updateVapiSquad" },
      {
        name: "DELETE /squad/{id}",
        implemented: true,
        tool: "deleteVapiSquad",
      },
    ],
  },

  // ===== WORKFLOWS (5/5) ✅ =====
  workflows: {
    total: 5,
    implemented: 5,
    endpoints: [
      { name: "GET /workflow", implemented: true, tool: "listVapiWorkflows" },
      { name: "POST /workflow", implemented: true, tool: "createVapiWorkflow" },
      {
        name: "GET /workflow/{id}",
        implemented: true,
        tool: "getVapiWorkflow",
      },
      {
        name: "PATCH /workflow/{id}",
        implemented: true,
        tool: "updateVapiWorkflow",
      },
      {
        name: "DELETE /workflow/{id}",
        implemented: true,
        tool: "deleteVapiWorkflow",
      },
    ],
  },

  // ===== TEST SUITES (5/5) ✅ =====
  testSuites: {
    total: 5,
    implemented: 5,
    endpoints: [
      {
        name: "GET /test-suite",
        implemented: true,
        tool: "listVapiTestSuites",
      },
      {
        name: "POST /test-suite",
        implemented: true,
        tool: "createVapiTestSuite",
      },
      {
        name: "GET /test-suite/{id}",
        implemented: true,
        tool: "getVapiTestSuite",
      },
      {
        name: "PATCH /test-suite/{id}",
        implemented: true,
        tool: "updateVapiTestSuite",
      },
      {
        name: "DELETE /test-suite/{id}",
        implemented: true,
        tool: "deleteVapiTestSuite",
      },
    ],
  },

  // ===== TEST SUITE TESTS (5/5) ✅ =====
  testSuiteTests: {
    total: 5,
    implemented: 5,
    endpoints: [
      {
        name: "GET /test-suite/{id}/test",
        implemented: true,
        tool: "listVapiTestSuiteTests",
      },
      {
        name: "POST /test-suite/{id}/test",
        implemented: true,
        tool: "createVapiTestSuiteTest",
      },
      {
        name: "GET /test-suite/{id}/test/{testId}",
        implemented: true,
        tool: "getVapiTestSuiteTest",
      },
      {
        name: "PATCH /test-suite/{id}/test/{testId}",
        implemented: true,
        tool: "updateVapiTestSuiteTest",
      },
      {
        name: "DELETE /test-suite/{id}/test/{testId}",
        implemented: true,
        tool: "deleteVapiTestSuiteTest",
      },
    ],
  },

  // ===== TEST SUITE RUNS (5/5) ✅ NOUVEAU ! =====
  testSuiteRuns: {
    total: 5,
    implemented: 5,
    endpoints: [
      {
        name: "GET /test-suite/{id}/run",
        implemented: true,
        tool: "listVapiTestSuiteRuns",
      },
      {
        name: "POST /test-suite/{id}/run",
        implemented: true,
        tool: "createVapiTestSuiteRun",
      },
      {
        name: "GET /test-suite/{id}/run/{runId}",
        implemented: true,
        tool: "getVapiTestSuiteRun",
      },
      {
        name: "PATCH /test-suite/{id}/run/{runId}",
        implemented: true,
        tool: "updateVapiTestSuiteRun",
      },
      {
        name: "DELETE /test-suite/{id}/run/{runId}",
        implemented: true,
        tool: "deleteVapiTestSuiteRun",
      },
    ],
  },

  // ===== FILES (4/5) ⚠️ =====
  files: {
    total: 5,
    implemented: 4,
    endpoints: [
      { name: "GET /file", implemented: true, tool: "listVapiFiles" },
      { name: "POST /file", implemented: true, tool: "uploadVapiFile" },
      { name: "GET /file/{id}", implemented: true, tool: "getVapiFile" },
      { name: "DELETE /file/{id}", implemented: true, tool: "deleteVapiFile" },
      { name: "PATCH /file/{id}", implemented: false, tool: "updateVapiFile" }, // Manquant
    ],
  },

  // ===== CALLS (3/8) ⚠️ =====
  calls: {
    total: 8,
    implemented: 3,
    endpoints: [
      { name: "GET /call", implemented: true, tool: "listVapiCalls" },
      { name: "POST /call", implemented: true, tool: "createVapiCall" },
      { name: "GET /call/{id}", implemented: true, tool: "getVapiCall" },
      { name: "PATCH /call/{id}", implemented: false, tool: "updateVapiCall" }, // Manquant
      { name: "DELETE /call/{id}", implemented: false, tool: "deleteVapiCall" }, // Manquant
      {
        name: "POST /call/{id}/hangup",
        implemented: false,
        tool: "hangupVapiCall",
      }, // Manquant
      {
        name: "POST /call/{id}/function-call",
        implemented: false,
        tool: "functionCallVapi",
      }, // Manquant
      { name: "POST /call/{id}/say", implemented: false, tool: "sayVapiCall" }, // Manquant
    ],
  },

  // ===== PHONE NUMBERS (3/5) ⚠️ =====
  phoneNumbers: {
    total: 5,
    implemented: 3,
    endpoints: [
      {
        name: "GET /phone-number",
        implemented: true,
        tool: "listVapiPhoneNumbers",
      },
      {
        name: "POST /phone-number",
        implemented: true,
        tool: "buyVapiPhoneNumber",
      },
      {
        name: "GET /phone-number/{id}",
        implemented: true,
        tool: "getVapiPhoneNumber",
      },
      {
        name: "PATCH /phone-number/{id}",
        implemented: false,
        tool: "updateVapiPhoneNumber",
      }, // Manquant
      {
        name: "DELETE /phone-number/{id}",
        implemented: false,
        tool: "deleteVapiPhoneNumber",
      }, // Manquant
    ],
  },

  // ===== BLOCKS (0/5) ❌ =====
  blocks: {
    total: 5,
    implemented: 0,
    endpoints: [
      { name: "GET /block", implemented: false, tool: "listVapiBlocks" },
      { name: "POST /block", implemented: false, tool: "createVapiBlock" },
      { name: "GET /block/{id}", implemented: false, tool: "getVapiBlock" },
      {
        name: "PATCH /block/{id}",
        implemented: false,
        tool: "updateVapiBlock",
      },
      {
        name: "DELETE /block/{id}",
        implemented: false,
        tool: "deleteVapiBlock",
      },
    ],
  },

  // ===== ANALYTICS (0/2) ❌ =====
  analytics: {
    total: 2,
    implemented: 0,
    endpoints: [
      {
        name: "GET /analytics/usage",
        implemented: false,
        tool: "getVapiUsageAnalytics",
      },
      {
        name: "GET /analytics/metrics",
        implemented: false,
        tool: "getVapiMetrics",
      },
    ],
  },

  // ===== LOGS (0/3) ❌ =====
  logs: {
    total: 3,
    implemented: 0,
    endpoints: [
      { name: "GET /log", implemented: false, tool: "listVapiLogs" },
      { name: "GET /log/{id}", implemented: false, tool: "getVapiLog" },
      { name: "DELETE /log/{id}", implemented: false, tool: "deleteVapiLog" },
    ],
  },

  // ===== METRICS (0/2) ❌ =====
  metrics: {
    total: 2,
    implemented: 0,
    endpoints: [
      {
        name: "GET /metrics/calls",
        implemented: false,
        tool: "getVapiCallMetrics",
      },
      {
        name: "GET /metrics/costs",
        implemented: false,
        tool: "getVapiCostMetrics",
      },
    ],
  },

  // ===== WEBHOOKS (0/3) ❌ =====
  webhooks: {
    total: 3,
    implemented: 0,
    endpoints: [
      { name: "GET /webhook", implemented: false, tool: "listVapiWebhooks" },
      { name: "POST /webhook", implemented: false, tool: "createVapiWebhook" },
      {
        name: "DELETE /webhook/{id}",
        implemented: false,
        tool: "deleteVapiWebhook",
      },
    ],
  },
};

// Calcul des statistiques
function calculateStats() {
  let totalEndpoints = 0;
  let implementedEndpoints = 0;
  let completeCategories = 0;
  let totalCategories = 0;

  console.log("\n📊 DÉTAIL PAR CATÉGORIE:");
  console.log("========================");

  Object.entries(VAPI_API_ENDPOINTS).forEach(([category, data]) => {
    totalCategories++;
    totalEndpoints += data.total;
    implementedEndpoints += data.implemented;

    const percentage = Math.round((data.implemented / data.total) * 100);
    const status =
      data.implemented === data.total
        ? "✅"
        : data.implemented > 0
        ? "⚠️"
        : "❌";

    if (data.implemented === data.total) {
      completeCategories++;
    }

    console.log(
      `${status} ${category.padEnd(20)} ${data.implemented}/${
        data.total
      } (${percentage}%)`
    );
  });

  const globalPercentage = Math.round(
    (implementedEndpoints / totalEndpoints) * 100
  );

  console.log("\n🎯 RÉSUMÉ GLOBAL:");
  console.log("=================");
  console.log(
    `📈 Progression globale: ${implementedEndpoints}/${totalEndpoints} endpoints (${globalPercentage}%)`
  );
  console.log(
    `📂 Catégories complètes: ${completeCategories}/${totalCategories}`
  );
  console.log(`🚀 Gain depuis Test Suite Tests: +5 endpoints (+7%)`);

  // Objectifs de couverture
  console.log("\n🎯 OBJECTIFS DE COUVERTURE:");
  console.log("============================");

  const objectives = [
    { target: 75, label: "Objectif 75%" },
    { target: 90, label: "Objectif 90%" },
    { target: 100, label: "Objectif 100%" },
  ];

  objectives.forEach((obj) => {
    const targetEndpoints = Math.ceil((obj.target / 100) * totalEndpoints);
    const remaining = Math.max(0, targetEndpoints - implementedEndpoints);
    const status = implementedEndpoints >= targetEndpoints ? "✅" : "⏳";

    console.log(
      `${status} ${obj.label}: ${targetEndpoints} endpoints (${remaining} restants)`
    );
  });

  return {
    totalEndpoints,
    implementedEndpoints,
    globalPercentage,
    completeCategories,
    totalCategories,
  };
}

// Prochaines priorités
function showNextPriorities() {
  console.log("\n🔥 PROCHAINES PRIORITÉS:");
  console.log("========================");

  const priorities = [
    {
      category: "Calls (compléter)",
      endpoints: 5,
      impact: "+7%",
      description: "Ajouter PATCH, DELETE, hangup, function-call, say",
    },
    {
      category: "Blocks",
      endpoints: 5,
      impact: "+7%",
      description: "Nouvelle catégorie complète (CRUD + list)",
    },
    {
      category: "Phone Numbers (compléter)",
      endpoints: 2,
      impact: "+3%",
      description: "Ajouter PATCH et DELETE",
    },
    {
      category: "Files (compléter)",
      endpoints: 1,
      impact: "+1%",
      description: "Ajouter PATCH /file/{id}",
    },
    {
      category: "Analytics",
      endpoints: 2,
      impact: "+3%",
      description: "Usage et metrics analytics",
    },
  ];

  priorities.forEach((priority, index) => {
    console.log(`${index + 1}. ${priority.category}`);
    console.log(
      `   📊 ${priority.endpoints} endpoints → ${priority.impact} couverture`
    );
    console.log(`   📝 ${priority.description}`);
    console.log("");
  });
}

// Nouveautés de cette version
function showNewFeatures() {
  console.log("\n🆕 NOUVEAUTÉS - TEST SUITE RUNS:");
  console.log("=================================");
  console.log(
    "✅ listVapiTestSuiteRuns - Lister les exécutions de test suites"
  );
  console.log("✅ createVapiTestSuiteRun - Créer/démarrer une exécution");
  console.log("✅ getVapiTestSuiteRun - Récupérer une exécution spécifique");
  console.log("✅ updateVapiTestSuiteRun - Mettre à jour une exécution");
  console.log("✅ deleteVapiTestSuiteRun - Supprimer une exécution");
  console.log("");
  console.log("🔧 Fonctionnalités:");
  console.log("• Exécution automatique des tests d'une suite");
  console.log("• Suivi du statut (queued, in-progress, completed, failed)");
  console.log("• Gestion des résultats et tentatives");
  console.log("• Intégration complète avec les Test Suites existantes");
}

// Exécution de l'analyse
console.log("🔍 Analyse en cours...\n");

showNewFeatures();
const stats = calculateStats();
showNextPriorities();

console.log("\n" + "=".repeat(60));
console.log(
  `🎉 SERVEUR MCP ALLOKOLI - ${stats.globalPercentage}% DE COUVERTURE API VAPI`
);
console.log(
  `📊 ${stats.implementedEndpoints}/${stats.totalEndpoints} endpoints • ${stats.completeCategories}/${stats.totalCategories} catégories complètes`
);
console.log("=".repeat(60));
