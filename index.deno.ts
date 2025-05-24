// @ts-nocheck - Ignorer les erreurs TypeScript pour l'environnement Deno
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../shared/cors.ts';
import { createErrorResponse, createSuccessResponse } from '../shared/response-helpers.ts';
import { validateSupabaseAuth } from '../shared/auth.ts';
import {
  validateRequest,
  CreateAssistantWithPhoneRequestSchema,
  ProvisionPhoneNumberRequestSchema,
  ListAssistantsRequestSchema,
  GetAssistantRequestSchema,
  UpdateAssistantRequestSchema,
  createRequestToAssistantConfig,
  generateSystemPrompt,
  type CreateAssistantWithPhoneRequest,
  type ProvisionPhoneNumberRequest,
  type ListAssistantsRequest,
  type GetAssistantRequest,
  type UpdateAssistantRequest,
  type AssistantConfig
} from '../shared/zod-schemas.ts';

// Configuration MCP
const MCP_CONFIG = {
  name: "allokoli-mcp-server",
  version: "1.0.0",
  description: "Serveur MCP AlloKoli pour la création et gestion d'assistants vocaux avec numéros de téléphone",
  tools: [
    {
      name: "createAssistantAndProvisionNumber",
      description: "Crée un assistant vocal complet avec numéro de téléphone provisionné automatiquement",
      inputSchema: {
        type: "object",
        properties: {
          assistantName: { type: "string", description: "Nom de l'assistant vocal" },
          businessType: { type: "string", description: "Type d'activité de l'entreprise" },
          assistantTone: { type: "string", description: "Ton de communication de l'assistant" },
          firstMessage: { type: "string", description: "Message d'accueil de l'assistant" },
          systemPromptCore: { type: "string", description: "Prompt système principal" },
          canTakeReservations: { type: "boolean", description: "L'assistant peut-il prendre des réservations" },
          canTakeAppointments: { type: "boolean", description: "L'assistant peut-il prendre des rendez-vous" },
          canTransferCall: { type: "boolean", description: "L'assistant peut-il transférer des appels" },
          companyName: { type: "string", description: "Nom de l'entreprise (optionnel)" },
          address: { type: "string", description: "Adresse de l'entreprise (optionnel)" },
          phoneNumber: { type: "string", description: "Numéro de téléphone de l'entreprise (optionnel)" },
          email: { type: "string", description: "Email de l'entreprise (optionnel)" },
          openingHours: { type: "string", description: "Horaires d'ouverture (optionnel)" }
        },
        required: ["assistantName", "businessType", "assistantTone", "firstMessage", "systemPromptCore"]
      }
    },
    {
      name: "provisionPhoneNumber",
      description: "Provisionne un nouveau numéro de téléphone via Twilio",
      inputSchema: {
        type: "object",
        properties: {
          country: { type: "string", description: "Code pays (ex: FR, US)" },
          areaCode: { type: "string", description: "Indicatif régional (optionnel)" },
          contains: { type: "string", description: "Pattern de recherche dans le numéro (optionnel)" },
          assistantId: { type: "string", description: "ID de l'assistant à associer (optionnel)" }
        }
      }
    },
    {
      name: "listAssistants",
      description: "Liste tous les assistants avec pagination et filtres",
      inputSchema: {
        type: "object",
        properties: {
          page: { type: "number", description: "Numéro de page" },
          limit: { type: "number", description: "Nombre d'éléments par page" },
          search: { type: "string", description: "Recherche par nom (optionnel)" },
          sector: { type: "string", description: "Filtrer par secteur d'activité (optionnel)" }
        }
      }
    },
    {
      name: "getAssistant",
      description: "Récupère les détails complets d'un assistant",
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
      description: "Met à jour les propriétés d'un assistant existant",
      inputSchema: {
        type: "object",
        properties: {
          assistantId: { type: "string", description: "ID unique de l'assistant" },
          updates: {
            type: "object",
            properties: {
              name: { type: "string", description: "Nouveau nom de l'assistant" },
              systemPrompt: { type: "string", description: "Nouveau prompt système" },
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

// Initialisation du client Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuration Twilio
const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');

// Configuration Vapi
const vapiApiKey = Deno.env.get('VAPI_API_KEY');

/**
 * Crée un assistant sur Vapi
 */
async function createVapiAssistant(config: AssistantConfig): Promise<{ id: string; success: boolean }> {
  if (!vapiApiKey) {
    throw new Error('VAPI_API_KEY non configurée');
  }

  const vapiPayload = {
    name: config.assistantProfile.name,
    model: {
      provider: config.vapiConfig.model.provider,
      model: config.vapiConfig.model.model,
      temperature: config.vapiConfig.model.temperature,
      maxTokens: config.vapiConfig.model.max_tokens,
      systemMessage: generateSystemPrompt(config)
    },
    voice: {
      provider: config.vapiConfig.voice.provider,
      voiceId: config.vapiConfig.voice.voice_id,
      stability: config.vapiConfig.voice.stability,
      similarityBoost: config.vapiConfig.voice.similarity_boost
    },
    firstMessage: config.vapiConfig.firstMessage,
    endCallMessage: config.vapiConfig.endCallMessage || "Merci pour votre appel. Au revoir !",
    language: config.assistantProfile.language
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
 * Provisionne un numéro de téléphone via Twilio
 */
async function provisionTwilioNumber(request: ProvisionPhoneNumberRequest): Promise<{ number: string; sid: string; success: boolean }> {
  if (!twilioAccountSid || !twilioAuthToken) {
    throw new Error('Credentials Twilio non configurés');
  }

  // Recherche de numéros disponibles
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
      'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`
    }
  });

  if (!searchResponse.ok) {
    const error = await searchResponse.text();
    throw new Error(`Erreur recherche Twilio: ${error}`);
  }

  const searchResult = await searchResponse.json();
  
  if (!searchResult.available_phone_numbers || searchResult.available_phone_numbers.length === 0) {
    throw new Error('Aucun numéro disponible avec les critères spécifiés');
  }

  const selectedNumber = searchResult.available_phone_numbers[0];

  // Achat du numéro
  const purchaseUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/IncomingPhoneNumbers.json`;
  const purchaseData = new URLSearchParams();
  purchaseData.append('PhoneNumber', selectedNumber.phone_number);
  purchaseData.append('FriendlyName', `AlloKoli Assistant Number`);

  const purchaseResponse = await fetch(purchaseUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
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
 * Outil MCP : Créer un assistant avec numéro de téléphone
 */
async function createAssistantAndProvisionNumber(request: CreateAssistantWithPhoneRequest, userId: string) {
  try {
    // 1. Validation des données
    const validation = validateRequest(CreateAssistantWithPhoneRequestSchema, request);
    if (!validation.success) {
      return createErrorResponse('Données invalides', 'VALIDATION_ERROR', validation.error.details);
    }

    const validatedRequest = validation.data;

    // 2. Génération de l'AssistantConfig
    const assistantConfig = createRequestToAssistantConfig(validatedRequest);

    // 3. Création de l'assistant sur Vapi
    const vapiResult = await createVapiAssistant(assistantConfig);

    // 4. Provisionnement du numéro Twilio
    const twilioResult = await provisionTwilioNumber({
      country: 'FR',
      areaCode: undefined,
      contains: undefined
    });

    // 5. Sauvegarde en base de données
    const { data: assistant, error: assistantError } = await supabase
      .from('assistants')
      .insert({
        user_id: userId,
        name: validatedRequest.assistantName,
        vapi_id: vapiResult.id,
        business_type: validatedRequest.businessType,
        sector: assistantConfig.metadata.sector,
        system_prompt: generateSystemPrompt(assistantConfig),
        first_message: validatedRequest.firstMessage,
        end_call_message: validatedRequest.endCallMessage,
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
      throw new Error(`Erreur sauvegarde numéro: ${phoneError.message}`);
    }

    // 6. Configuration du routage Twilio vers Vapi
    // TODO: Configurer le webhook Twilio pour router vers Vapi

    return createSuccessResponse({
      assistant: {
        id: assistant.id,
        name: assistant.name,
        vapi_id: assistant.vapi_id,
        created_at: assistant.created_at
      },
      phoneNumber: {
        id: phoneNumber.id,
        number: phoneNumber.number,
        twilio_sid: phoneNumber.twilio_sid,
        country: phoneNumber.country,
        is_active: phoneNumber.is_active
      },
      assistantConfig
    }, 'Assistant créé avec succès avec numéro de téléphone');

  } catch (error) {
    console.error('Erreur createAssistantAndProvisionNumber:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Erreur inconnue',
      'CREATION_ERROR'
    );
  }
}

/**
 * Outil MCP : Provisionner un numéro de téléphone
 */
async function provisionPhoneNumber(request: ProvisionPhoneNumberRequest, userId: string) {
  try {
    const validation = validateRequest(ProvisionPhoneNumberRequestSchema, request);
    if (!validation.success) {
      return createErrorResponse('Données invalides', 'VALIDATION_ERROR', validation.error.details);
    }

    const validatedRequest = validation.data;
    const twilioResult = await provisionTwilioNumber(validatedRequest);

    const { data: phoneNumber, error } = await supabase
      .from('phone_numbers')
      .insert({
        user_id: userId,
        assistant_id: validatedRequest.assistantId || null,
        number: twilioResult.number,
        twilio_sid: twilioResult.sid,
        country: validatedRequest.country,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur sauvegarde: ${error.message}`);
    }

    return createSuccessResponse({
      phoneNumber: {
        id: phoneNumber.id,
        number: phoneNumber.number,
        twilio_sid: phoneNumber.twilio_sid,
        country: phoneNumber.country,
        is_active: phoneNumber.is_active,
        created_at: phoneNumber.created_at
      }
    }, 'Numéro provisionné avec succès');

  } catch (error) {
    console.error('Erreur provisionPhoneNumber:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Erreur inconnue',
      'PROVISION_ERROR'
    );
  }
}

/**
 * Outil MCP : Lister les assistants
 */
async function listAssistants(request: ListAssistantsRequest, userId: string) {
  try {
    const validation = validateRequest(ListAssistantsRequestSchema, request);
    if (!validation.success) {
      return createErrorResponse('Données invalides', 'VALIDATION_ERROR', validation.error.details);
    }

    const { page, limit, search, sector } = validation.data;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('assistants')
      .select(`
        id,
        name,
        business_type,
        sector,
        is_active,
        created_at,
        phone_numbers(number),
        calls(id)
      `)
      .eq('user_id', userId);

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    if (sector) {
      query = query.eq('sector', sector);
    }

    const { data: assistants, error, count } = await query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erreur requête: ${error.message}`);
    }

    const formattedAssistants = assistants?.map(assistant => ({
      id: assistant.id,
      name: assistant.name,
      business_type: assistant.business_type,
      sector: assistant.sector,
      phone_number: assistant.phone_numbers?.[0]?.number || null,
      is_active: assistant.is_active,
      created_at: assistant.created_at,
      call_count: assistant.calls?.length || 0
    })) || [];

    return createSuccessResponse(
      formattedAssistants,
      'Assistants récupérés avec succès',
      {
        page,
        limit,
        total: count || 0,
        has_more: (count || 0) > offset + limit
      }
    );

  } catch (error) {
    console.error('Erreur listAssistants:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Erreur inconnue',
      'LIST_ERROR'
    );
  }
}

/**
 * Outil MCP : Obtenir les détails d'un assistant
 */
async function getAssistant(request: GetAssistantRequest, userId: string) {
  try {
    const validation = validateRequest(GetAssistantRequestSchema, request);
    if (!validation.success) {
      return createErrorResponse('Données invalides', 'VALIDATION_ERROR', validation.error.details);
    }

    const { assistantId } = validation.data;

    const { data: assistant, error } = await supabase
      .from('assistants')
      .select(`
        *,
        phone_numbers(number),
        calls(id, duration_seconds, created_at)
      `)
      .eq('id', assistantId)
      .eq('user_id', userId)
      .single();

    if (error) {
      throw new Error(`Assistant non trouvé: ${error.message}`);
    }

    // Calcul des statistiques
    const calls = assistant.calls || [];
    const totalCalls = calls.length;
    const totalDurationMinutes = calls.reduce((sum: number, call: any) => sum + (call.duration_seconds || 0), 0) / 60;
    const averageCallDuration = totalCalls > 0 ? totalDurationMinutes / totalCalls : 0;
    const lastCallAt = calls.length > 0 ? calls[0].created_at : null;

    return createSuccessResponse({
      id: assistant.id,
      name: assistant.name,
      vapi_id: assistant.vapi_id,
      business_type: assistant.business_type,
      sector: assistant.sector,
      system_prompt: assistant.system_prompt,
      first_message: assistant.first_message,
      end_call_message: assistant.end_call_message,
      phone_number: assistant.phone_numbers?.[0]?.number || null,
      is_active: assistant.is_active,
      created_at: assistant.created_at,
      updated_at: assistant.updated_at,
      assistant_config: assistant.assistant_config,
      stats: {
        total_calls: totalCalls,
        total_duration_minutes: Math.round(totalDurationMinutes * 100) / 100,
        average_call_duration: Math.round(averageCallDuration * 100) / 100,
        last_call_at: lastCallAt
      }
    }, 'Détails de l\'assistant récupérés avec succès');

  } catch (error) {
    console.error('Erreur getAssistant:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Erreur inconnue',
      'GET_ERROR'
    );
  }
}

/**
 * Outil MCP : Mettre à jour un assistant
 */
async function updateAssistant(request: UpdateAssistantRequest, userId: string) {
  try {
    const validation = validateRequest(UpdateAssistantRequestSchema, request);
    if (!validation.success) {
      return createErrorResponse('Données invalides', 'VALIDATION_ERROR', validation.error.details);
    }

    const { assistantId, updates } = validation.data;

    const { data: assistant, error } = await supabase
      .from('assistants')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', assistantId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur mise à jour: ${error.message}`);
    }

    // TODO: Mettre à jour l'assistant sur Vapi si nécessaire

    return createSuccessResponse(
      assistant,
      'Assistant mis à jour avec succès'
    );

  } catch (error) {
    console.error('Erreur updateAssistant:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Erreur inconnue',
      'UPDATE_ERROR'
    );
  }
}

/**
 * Gestionnaire principal du serveur MCP
 */
Deno.serve(async (req) => {
  // Gestion CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;

    // Route de découverte MCP
    if (path === '/mcp' && req.method === 'GET') {
      return new Response(JSON.stringify(MCP_CONFIG), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Routes des outils MCP
    if (path.startsWith('/mcp/tools/') && req.method === 'POST') {
      // Authentification
      const authResult = await validateSupabaseAuth(req, supabase);
      if (!authResult.success) {
        return new Response(JSON.stringify(authResult), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const userId = authResult.user.id;
      const toolName = path.split('/').pop();
      const requestData = await req.json();

      let result;

      switch (toolName) {
        case 'createAssistantAndProvisionNumber':
          result = await createAssistantAndProvisionNumber(requestData, userId);
          break;
        case 'provisionPhoneNumber':
          result = await provisionPhoneNumber(requestData, userId);
          break;
        case 'listAssistants':
          result = await listAssistants(requestData, userId);
          break;
        case 'getAssistant':
          result = await getAssistant(requestData, userId);
          break;
        case 'updateAssistant':
          result = await updateAssistant(requestData, userId);
          break;
        default:
          result = createErrorResponse(`Outil inconnu: ${toolName}`, 'UNKNOWN_TOOL');
      }

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: result.success ? 200 : 400
      });
    }

    // Route par défaut
    return new Response(JSON.stringify({
      success: false,
      error: 'Route non trouvée'
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erreur serveur MCP:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur interne'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}); 