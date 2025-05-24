# 🔧 Intégration AlloKoli MCP dans Cursor Existant

## 📋 Ajout à ta Configuration Actuelle

Tu as déjà plusieurs serveurs MCP configurés dans Cursor. Voici comment ajouter AlloKoli à ta configuration existante.

### 🎯 Étape 1: Localiser ton Fichier MCP

Ton fichier de configuration se trouve ici :
```
C:\Users\USER\.cursor\mcp.json
```

### 🎯 Étape 2: Ajouter AlloKoli

Ajoute cette section dans ton objet `mcpServers` existant :

```json
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
  "description": "Serveur MCP AlloKoli pour la création et gestion d'assistants vocaux avec Vapi et Twilio"
}
```

### 🎯 Étape 3: Configuration Complète

Voici ton fichier `mcp.json` complet avec AlloKoli ajouté :

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "sbp_7fd49ef538d9d190a9c548001692347a5f624ce3"
      ]
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/server-filesystem",
        "C:\\Users\\USER\\.cursor"
      ]
    },
    "github": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-github"]
    },
    "puppeteer": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-puppeteer"]
    },
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest"
      ]
    },
    "@reapi/mcp-openapi": {
      "command": "npx",
      "args": ["-y", "@reapi/mcp-openapi@latest", "--dir", "./specs"],
      "env": {}
    },
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
      "description": "Serveur MCP AlloKoli pour la création et gestion d'assistants vocaux avec Vapi et Twilio"
    }
  }
}
```

## 🔑 Variables d'Environnement à Remplacer

Remplace ces valeurs par tes vraies clés API :

### Supabase
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Où trouver** : Supabase Dashboard > Settings > API > service_role key

### Vapi
```
VAPI_API_KEY=vapi_key_...
```
**Où trouver** : Vapi Dashboard > API Keys

### Twilio
```
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
```
**Où trouver** : Twilio Console > Account Info

## 🚀 Installation et Test

### 1. Installation du Package

```bash
npm install -g allokoli-mcp-server
```

### 2. Redémarrage de Cursor

Après avoir modifié le fichier `mcp.json`, redémarre Cursor complètement.

### 3. Test de Fonctionnement

Dans Cursor, teste avec :

```
Peux-tu lister mes assistants vocaux ?
```

Ou pour créer un nouvel assistant :

```
Crée un assistant vocal pour un restaurant italien nommé "Bella Vista" avec un ton chaleureux
```

## 🛠️ Outils AlloKoli Disponibles

Une fois configuré, tu auras accès à ces 5 nouveaux outils :

### 1. `createAssistantAndProvisionNumber`
- **Fonction** : Crée un assistant vocal complet + numéro automatique
- **Exemple** : "Crée un assistant pour une pizzeria"

### 2. `provisionPhoneNumber`
- **Fonction** : Provisionne un nouveau numéro Twilio
- **Exemple** : "Provisionne un numéro français"

### 3. `listAssistants`
- **Fonction** : Liste tous tes assistants
- **Exemple** : "Liste mes assistants vocaux"

### 4. `getAssistant`
- **Fonction** : Détails d'un assistant spécifique
- **Exemple** : "Montre l'assistant ID 123"

### 5. `updateAssistant`
- **Fonction** : Met à jour un assistant
- **Exemple** : "Mets à jour le message d'accueil"

## 🔍 Dépannage

### Problème : AlloKoli MCP non détecté

1. **Vérifie l'installation** :
   ```bash
   npm list -g allokoli-mcp-server
   ```

2. **Vérifie la syntaxe JSON** :
   - Assure-toi qu'il y a une virgule après `@reapi/mcp-openapi`
   - Vérifie que toutes les accolades sont fermées

3. **Redémarre Cursor** complètement

### Problème : Erreurs d'authentification

1. **Vérifie tes clés API** dans les variables d'environnement
2. **Teste la connexion Supabase** séparément
3. **Vérifie les permissions** Twilio et Vapi

## 🎯 Intégration avec tes Autres MCP

AlloKoli s'intègre parfaitement avec tes autres serveurs MCP :

- **Supabase MCP** : Pour la gestion de base de données
- **GitHub MCP** : Pour le versioning du code
- **Filesystem MCP** : Pour la gestion des fichiers
- **Puppeteer/Playwright** : Pour les tests automatisés
- **OpenAPI MCP** : Pour la documentation API
- **AlloKoli MCP** : Pour les assistants vocaux

Tu peux maintenant créer des workflows complets qui combinent tous ces outils !

## ✅ Vérification Finale

Après configuration, tu devrais voir dans Cursor :
- ✅ 6 serveurs MCP actifs (incluant AlloKoli)
- ✅ Nouveaux outils disponibles pour assistants vocaux
- ✅ Intégration transparente avec tes workflows existants 