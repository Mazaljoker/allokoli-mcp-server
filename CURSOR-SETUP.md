# 🎯 Configuration MCP AlloKoli pour Cursor

## 📋 Installation

### 1. Installation du Package MCP

```bash
npm install -g allokoli-mcp-server
```

### 2. Configuration Cursor

#### Option A: Via l'Interface Cursor

1. **Ouvre Cursor**
2. **Va dans** : `Cursor > Preferences > Extensions > MCP`
3. **Clique sur** "Add MCP Server"
4. **Nom** : `allokoli`
5. **Command** : `npx`
6. **Args** : `["allokoli-mcp-server"]`
7. **Environment Variables** : (voir ci-dessous)

#### Option B: Configuration Manuelle

**Fichier de configuration** : `~/.cursor/mcp_servers.json`

```json
{
  "mcpServers": {
    "allokoli": {
      "command": "npx",
      "args": ["allokoli-mcp-server"],
      "env": {
        "SUPABASE_URL": "https://aiurboizarbbcpynmmgv.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "your_service_role_key",
        "VAPI_API_KEY": "your_vapi_api_key",
        "TWILIO_ACCOUNT_SID": "your_twilio_account_sid",
        "TWILIO_AUTH_TOKEN": "your_twilio_auth_token"
      },
      "disabled": false,
      "alwaysAllow": [],
      "description": "Serveur MCP AlloKoli pour la création et gestion d'assistants vocaux"
    }
  },
  "globalShortcut": "CommandOrControl+Shift+M",
  "mcpSettings": {
    "timeout": 30000,
    "retries": 3,
    "logLevel": "info"
  }
}
```

## 🔧 Variables d'Environnement Requises

Remplace les valeurs suivantes dans la configuration :

```env
SUPABASE_URL=https://aiurboizarbbcpynmmgv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VAPI_API_KEY=vapi_key_...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
```

## 🛠️ Outils MCP Disponibles

Une fois configuré, tu auras accès à ces outils dans Cursor :

### 1. `createAssistantAndProvisionNumber`
Crée un assistant vocal complet avec numéro de téléphone automatique.

**Exemple d'utilisation** :
```
Crée un assistant vocal pour un restaurant italien nommé "Bella Vista"
```

### 2. `provisionPhoneNumber`
Provisionne un nouveau numéro de téléphone via Twilio.

**Exemple d'utilisation** :
```
Provisionne un numéro de téléphone français pour l'assistant ID 123
```

### 3. `listAssistants`
Liste tous les assistants avec pagination.

**Exemple d'utilisation** :
```
Liste tous mes assistants vocaux
```

### 4. `getAssistant`
Récupère les détails d'un assistant spécifique.

**Exemple d'utilisation** :
```
Montre-moi les détails de l'assistant ID 456
```

### 5. `updateAssistant`
Met à jour les propriétés d'un assistant.

**Exemple d'utilisation** :
```
Mets à jour l'assistant "Bella Vista" avec un nouveau message d'accueil
```

## 🚀 Test de Fonctionnement

### 1. Redémarre Cursor

Après la configuration, redémarre Cursor pour charger le MCP.

### 2. Test Simple

Dans Cursor, tape :
```
Peux-tu lister mes assistants vocaux ?
```

### 3. Test Complet

```
Crée un assistant vocal pour une pizzeria nommée "Mario's Pizza" avec un ton amical et un message d'accueil chaleureux
```

## 🔍 Dépannage

### Problème : MCP non détecté

1. **Vérifie** que Node.js est installé : `node --version`
2. **Vérifie** que le package est installé : `npm list -g allokoli-mcp-server`
3. **Redémarre** Cursor complètement

### Problème : Erreurs d'authentification

1. **Vérifie** tes variables d'environnement
2. **Teste** la connexion Supabase
3. **Vérifie** les permissions des clés API

### Problème : Timeout

Augmente le timeout dans la configuration :
```json
"mcpSettings": {
  "timeout": 60000
}
```

## 📞 Support

- **Repository** : https://github.com/Mazaljoker/allokoli-mcp-server
- **Documentation** : README.md
- **Issues** : GitHub Issues

## 🎯 Fonctionnalités Avancées

### Raccourci Clavier

Utilise `Ctrl+Shift+M` (ou `Cmd+Shift+M` sur Mac) pour accéder rapidement aux outils MCP.

### Auto-completion

Cursor proposera automatiquement les outils MCP disponibles quand tu tapes des commandes liées aux assistants vocaux.

### Intégration Workflow

Le MCP s'intègre parfaitement dans ton workflow de développement Cursor pour créer des assistants vocaux directement depuis l'éditeur. 