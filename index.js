// AlloKoli MCP Server - Version Node.js adaptee pour Smithery
// Adapte automatiquement du code Deno original

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Configuration MCP
const MCP_CONFIG = {
  name: "allokoli-mcp-server",
  version: "1.0.0",
  description: "Serveur MCP AlloKoli pour la creation et gestion d'assistants vocaux"
};

// Initialisation du serveur MCP
const server = new Server(
  {
    name: MCP_CONFIG.name,
    version: MCP_CONFIG.version,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuration Twilio
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;

// Configuration Vapi
const vapiApiKey = process.env.VAPI_API_KEY;

// Outils MCP
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: "createAssistantAndProvisionNumber",
        description: "Cree un assistant vocal complet avec numero de telephone provisionne automatiquement",
        inputSchema: {
          type: "object",
          properties: {
            assistantName: { type: "string", description: "Nom de l'assistant vocal" },
            businessType: { type: "string", description: "Type d'activite de l'entreprise" },
            assistantTone: { type: "string", description: "Ton de communication de l'assistant" },
            firstMessage: { type: "string", description: "Message d'accueil de l'assistant" },
            systemPromptCore: { type: "string", description: "Prompt systeme principal" },
            canTakeReservations: { type: "boolean", description: "L'assistant peut-il prendre des reservations" },
            canTakeAppointments: { type: "boolean", description: "L'assistant peut-il prendre des rendez-vous" },
            canTransferCall: { type: "boolean", description: "L'assistant peut-il transferer des appels" },
            companyName: { type: "string", description: "Nom de l'entreprise (optionnel)" },
            address: { type: "string", description: "Adresse de l'entreprise (optionnel)" },
            phoneNumber: { type: "string", description: "Numero de telephone de l'entreprise (optionnel)" },
            email: { type: "string", description: "Email de l'entreprise (optionnel)" },
            openingHours: { type: "string", description: "Horaires d'ouverture (optionnel)" }
          },
          required: ["assistantName", "businessType", "assistantTone", "firstMessage", "systemPromptCore"]
        }
      },
      {
        name: "provisionPhoneNumber",
        description: "Provisionne un nouveau numero de telephone via Twilio",
        inputSchema: {
          type: "object",
          properties: {
            country: { type: "string", description: "Code pays (ex: FR, US)" },
            areaCode: { type: "string", description: "Indicatif regional (optionnel)" },
            contains: { type: "string", description: "Pattern de recherche dans le numero (optionnel)" },
            assistantId: { type: "string", description: "ID de l'assistant a associer (optionnel)" }
          }
        }
      },
      {
        name: "listAssistants",
        description: "Liste tous les assistants avec pagination et filtres",
        inputSchema: {
          type: "object",
          properties: {
            page: { type: "number", description: "Numero de page" },
            limit: { type: "number", description: "Nombre d'elements par page" },
            search: { type: "string", description: "Recherche par nom (optionnel)" },
            sector: { type: "string", description: "Filtrer par secteur d'activite (optionnel)" }
          }
        }
      },
      {
        name: "getAssistant",
        description: "Recupere les details complets d'un assistant",
        inputSchema: {
          type: "object",
          properties: {
            assistantId: { type: "string", description: "ID unique de l'assistant" }
          },
          required: ["assistantId"]
        }
      },
      {
        name: "updateAssistant",
        description: "Met a jour les proprietes d'un assistant existant",
        inputSchema: {
          type: "object",
          properties: {
            assistantId: { type: "string", description: "ID unique de l'assistant" },
            updates: {
              type: "object",
              properties: {
                name: { type: "string", description: "Nouveau nom de l'assistant" },
                systemPrompt: { type: "string", description: "Nouveau prompt systeme" },
                firstMessage: { type: "string", description: "Nouveau message d'accueil" },
                endCallMessage: { type: "string", description: "Nouveau message de fin d'appel" },
                isActive: { type: "boolean", description: "Statut actif/inactif" }
              }
            }
          },
          required: ["assistantId", "updates"]
        }
      }
    ]
  };
});

// Gestionnaire d'outils
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    // Simulation d'authentification (a adapter)
    const userId = 'user-demo';
    
    switch (name) {
      case 'createAssistantAndProvisionNumber':
        return await createAssistantAndProvisionNumber(args, userId);
      case 'provisionPhoneNumber':
        return await provisionPhoneNumber(args, userId);
      case 'listAssistants':
        return await listAssistants(args, userId);
      case 'getAssistant':
        return await getAssistant(args, userId);
      case 'updateAssistant':
        return await updateAssistant(args, userId);
      default:
        throw new Error(`Outil inconnu: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Erreur: ${error.message}`
        }
      ],
      isError: true
    };
  }
});

/**
 * Cree un assistant sur Vapi
 */
async function createVapiAssistant(config) {
  if (!vapiApiKey) {
    throw new Error('VAPI_API_KEY non configuree');
  }

  const vapiPayload = {
    name: config.name,
    model: {
      provider: "openai",
      model: "gpt-4",
      temperature: 0.7,
      maxTokens: 500,
      systemMessage: config.systemPrompt
    },
    voice: {
      provider: "elevenlabs",
      voiceId: "21m00Tcm4TlvDq8ikWAM",
      stability: 0.5,
      similarityBoost: 0.8
    },
    firstMessage: config.firstMessage,
    endCallMessage: config.endCallMessage || "Merci pour votre appel. Au revoir !",
    language: "fr"
  };

  const response = await fetch('https://api.vapi.ai/assistant', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${vapiApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(vapiPayload)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur Vapi: ${error}`);
  }

  const vapiAssistant = await response.json();
  return { id: vapiAssistant.id, success: true };
}

/**
 * Provisionne un numero de telephone via Twilio
 */
async function provisionTwilioNumber(request) {
  if (!twilioAccountSid || !twilioAuthToken) {
    throw new Error('Credentials Twilio non configures');
  }

  // Recherche de numeros disponibles
  const searchUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/AvailablePhoneNumbers/${request.country}/Local.json`;
  const searchParams = new URLSearchParams();
  
  if (request.areaCode) {
    searchParams.append('AreaCode', request.areaCode);
  }
  if (request.contains) {
    searchParams.append('Contains', request.contains);
  }
  searchParams.append('Limit', '1');

  const searchResponse = await fetch(`${searchUrl}?${searchParams}`, {
    headers: {
      'Authorization': `Basic ${Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64')}`
    }
  });

  if (!searchResponse.ok) {
    const error = await searchResponse.text();
    throw new Error(`Erreur recherche Twilio: ${error}`);
  }

  const searchResult = await searchResponse.json();
  
  if (!searchResult.available_phone_numbers || searchResult.available_phone_numbers.length === 0) {
    throw new Error('Aucun numero disponible avec les criteres specifies');
  }

  const selectedNumber = searchResult.available_phone_numbers[0];

  // Achat du numero
  const purchaseUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/IncomingPhoneNumbers.json`;
  const purchaseData = new URLSearchParams();
  purchaseData.append('PhoneNumber', selectedNumber.phone_number);
  purchaseData.append('FriendlyName', `AlloKoli Assistant Number`);

  const purchaseResponse = await fetch(purchaseUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: purchaseData
  });

  if (!purchaseResponse.ok) {
    const error = await purchaseResponse.text();
    throw new Error(`Erreur achat Twilio: ${error}`);
  }

  const purchaseResult = await purchaseResponse.json();
  
  return {
    number: purchaseResult.phone_number,
    sid: purchaseResult.sid,
    success: true
  };
}

/**
 * Outil MCP : Creer un assistant avec numero de telephone
 */
async function createAssistantAndProvisionNumber(request, userId) {
  try {
    // 1. Generation de la configuration assistant
    const assistantConfig = {
      name: request.assistantName,
      systemPrompt: `Tu es ${request.assistantName}, un assistant vocal pour une entreprise de type ${request.businessType}. 
      Ton ton de communication est ${request.assistantTone}. 
      ${request.systemPromptCore}
      
      Informations de l'entreprise:
      ${request.companyName ? `- Nom: ${request.companyName}` : ''}
      ${request.address ? `- Adresse: ${request.address}` : ''}
      ${request.phoneNumber ? `- Telephone: ${request.phoneNumber}` : ''}
      ${request.email ? `- Email: ${request.email}` : ''}
      ${request.openingHours ? `- Horaires: ${request.openingHours}` : ''}
      
      Capacites:
      ${request.canTakeReservations ? '- Tu peux prendre des reservations' : ''}
      ${request.canTakeAppointments ? '- Tu peux prendre des rendez-vous' : ''}
      ${request.canTransferCall ? '- Tu peux transferer des appels' : ''}`,
      firstMessage: request.firstMessage,
      endCallMessage: "Merci pour votre appel. Au revoir !"
    };

    // 2. Creation de l'assistant sur Vapi
    const vapiResult = await createVapiAssistant(assistantConfig);

    // 3. Provisionnement du numero Twilio
    const twilioResult = await provisionTwilioNumber({
      country: 'FR',
      areaCode: undefined,
      contains: undefined
    });

    // 4. Sauvegarde en base de donnees
    const { data: assistant, error: assistantError } = await supabase
      .from('assistants')
      .insert({
        user_id: userId,
        name: request.assistantName,
        vapi_id: vapiResult.id,
        business_type: request.businessType,
        system_prompt: assistantConfig.systemPrompt,
        first_message: request.firstMessage,
        end_call_message: assistantConfig.endCallMessage,
        assistant_config: assistantConfig,
        is_active: true
      })
      .select()
      .single();

    if (assistantError) {
      throw new Error(`Erreur sauvegarde assistant: ${assistantError.message}`);
    }

    const { data: phoneNumber, error: phoneError } = await supabase
      .from('phone_numbers')
      .insert({
        user_id: userId,
        assistant_id: assistant.id,
        number: twilioResult.number,
        twilio_sid: twilioResult.sid,
        country: 'FR',
        is_active: true
      })
      .select()
      .single();

    if (phoneError) {
      throw new Error(`Erreur sauvegarde numero: ${phoneError.message}`);
    }

    return {
      content: [
        {
          type: "text",
          text: `Assistant "${request.assistantName}" cree avec succes !
          
Vapi ID: ${vapiResult.id}
Numero de telephone: ${twilioResult.number}
Assistant ID: ${assistant.id}

L'assistant est maintenant pret a recevoir des appels.`
        }
      ]
    };

  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Erreur lors de la creation de l'assistant: ${error.message}`
        }
      ],
      isError: true
    };
  }
}

/**
 * Outil MCP : Provisionner un numero de telephone
 */
async function provisionPhoneNumber(request, userId) {
  try {
    const twilioResult = await provisionTwilioNumber(request);

    // Sauvegarde en base si un assistant est specifie
    if (request.assistantId) {
      const { data: phoneNumber, error: phoneError } = await supabase
        .from('phone_numbers')
        .insert({
          user_id: userId,
          assistant_id: request.assistantId,
          number: twilioResult.number,
          twilio_sid: twilioResult.sid,
          country: request.country || 'FR',
          is_active: true
        })
        .select()
        .single();

      if (phoneError) {
        throw new Error(`Erreur sauvegarde numero: ${phoneError.message}`);
      }
    }

    return {
      content: [
        {
          type: "text",
          text: `Numero de telephone provisionne avec succes !
          
Numero: ${twilioResult.number}
Twilio SID: ${twilioResult.sid}
${request.assistantId ? `Associe a l'assistant: ${request.assistantId}` : 'Non associe a un assistant'}`
        }
      ]
    };

  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Erreur lors du provisioning: ${error.message}`
        }
      ],
      isError: true
    };
  }
}

/**
 * Outil MCP : Lister les assistants
 */
async function listAssistants(request, userId) {
  try {
    const page = request.page || 1;
    const limit = request.limit || 10;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('assistants')
      .select(`
        *,
        phone_numbers (
          number,
          country,
          is_active
        )
      `)
      .eq('user_id', userId)
      .range(offset, offset + limit - 1);

    if (request.search) {
      query = query.ilike('name', `%${request.search}%`);
    }

    if (request.sector) {
      query = query.eq('business_type', request.sector);
    }

    const { data: assistants, error } = await query;

    if (error) {
      throw new Error(`Erreur recuperation assistants: ${error.message}`);
    }

    const assistantsList = assistants.map(assistant => {
      const phoneNumbers = assistant.phone_numbers || [];
      return `- ${assistant.name} (${assistant.business_type})
  ID: ${assistant.id}
  Vapi ID: ${assistant.vapi_id}
  Statut: ${assistant.is_active ? 'Actif' : 'Inactif'}
  Numeros: ${phoneNumbers.map(p => p.number).join(', ') || 'Aucun'}`;
    }).join('\n\n');

    return {
      content: [
        {
          type: "text",
          text: `Liste des assistants (page ${page}):

${assistantsList}

Total: ${assistants.length} assistants`
        }
      ]
    };

  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Erreur lors de la recuperation: ${error.message}`
        }
      ],
      isError: true
    };
  }
}

/**
 * Outil MCP : Recuperer un assistant
 */
async function getAssistant(request, userId) {
  try {
    const { data: assistant, error } = await supabase
      .from('assistants')
      .select(`
        *,
        phone_numbers (
          number,
          twilio_sid,
          country,
          is_active
        )
      `)
      .eq('id', request.assistantId)
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new Error(`Erreur recuperation assistant: ${error.message}`);
    }

    if (!assistant) {
      throw new Error('Assistant non trouve');
    }

    const phoneNumbers = assistant.phone_numbers || [];
    const phoneNumbersList = phoneNumbers.map(p => 
      `  - ${p.number} (${p.country}) - ${p.is_active ? 'Actif' : 'Inactif'}`
    ).join('\n');

    return {
      content: [
        {
          type: "text",
          text: `Details de l'assistant:

Nom: ${assistant.name}
ID: ${assistant.id}
Vapi ID: ${assistant.vapi_id}
Type d'entreprise: ${assistant.business_type}
Statut: ${assistant.is_active ? 'Actif' : 'Inactif'}

Message d'accueil:
${assistant.first_message}

Message de fin:
${assistant.end_call_message}

Prompt systeme:
${assistant.system_prompt}

Numeros de telephone:
${phoneNumbersList || '  Aucun numero associe'}

Cree le: ${new Date(assistant.created_at).toLocaleString('fr-FR')}
Modifie le: ${new Date(assistant.updated_at).toLocaleString('fr-FR')}`
        }
      ]
    };

  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Erreur lors de la recuperation: ${error.message}`
        }
      ],
      isError: true
    };
  }
}

/**
 * Outil MCP : Mettre a jour un assistant
 */
async function updateAssistant(request, userId) {
  try {
    const updates = {};
    
    if (request.updates.name) updates.name = request.updates.name;
    if (request.updates.systemPrompt) updates.system_prompt = request.updates.systemPrompt;
    if (request.updates.firstMessage) updates.first_message = request.updates.firstMessage;
    if (request.updates.endCallMessage) updates.end_call_message = request.updates.endCallMessage;
    if (typeof request.updates.isActive === 'boolean') updates.is_active = request.updates.isActive;

    updates.updated_at = new Date().toISOString();

    const { data: assistant, error } = await supabase
      .from('assistants')
      .update(updates)
      .eq('id', request.assistantId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur mise a jour assistant: ${error.message}`);
    }

    if (!assistant) {
      throw new Error('Assistant non trouve');
    }

    return {
      content: [
        {
          type: "text",
          text: `Assistant mis a jour avec succes !

Nom: ${assistant.name}
ID: ${assistant.id}
Statut: ${assistant.is_active ? 'Actif' : 'Inactif'}

Modifications appliquees:
${Object.keys(updates).map(key => `- ${key}: ${updates[key]}`).join('\n')}`
        }
      ]
    };

  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Erreur lors de la mise a jour: ${error.message}`
        }
      ],
      isError: true
    };
  }
}

// Demarrage du serveur MCP
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Serveur MCP AlloKoli demarre');
}

main().catch(console.error);
