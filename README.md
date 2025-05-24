# AlloKoli MCP Server

Serveur MCP (Model Context Protocol) pour creer et gerer des assistants vocaux avec Vapi et Twilio.

## Fonctionnalites

- Creation d'assistants vocaux complets
- Provisioning automatique de numeros Twilio
- Gestion CRUD des assistants
- Integration Vapi + Supabase + Twilio
- 5 outils MCP disponibles

## Installation

`ash
npm install allokoli-mcp-server
`

## Configuration

Variables d'environnement requises :

`env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VAPI_API_KEY=your_vapi_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
`

## Utilisation avec Claude Desktop

Ajoutez a votre configuration Claude Desktop :

`json
{
  "mcpServers": {
    "allokoli": {
      "command": "npx",
      "args": ["allokoli-mcp-server"],
      "env": {
        "SUPABASE_URL": "https://your-project.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your_key",
        "VAPI_API_KEY": "your_key",
        "TWILIO_ACCOUNT_SID": "your_sid",
        "TWILIO_AUTH_TOKEN": "your_token"
      }
    }
  }
}
`

## Outils Disponibles

1. **createAssistantAndProvisionNumber** - Cree un assistant vocal complet avec numero de telephone provisionne automatiquement
2. **listAssistants** - Liste tous les assistants
3. **getAssistant** - Recupere un assistant specifique
4. **updateAssistant** - Met a jour un assistant
5. **provisionPhoneNumber** - Provisionne un nouveau numero

## Licence

MIT (c) AlloKoli Team
