# Next.js 15 + Supabase + Shadcn/ui Boilerplate

Ce projet est un boilerplate Next.js 15 avec authentification Supabase, interface admin, et composants Shadcn/ui.

## Fonctionnalités

- ✅ Next.js 15 avec App Router
- ✅ Authentification Supabase (login, register, logout)
- ✅ Interface d'administration avec gestion des utilisateurs
- ✅ Composants UI avec Shadcn/ui et Tailwind CSS
- ✅ Server Actions et validation avec Zod
- ✅ Architecture basée sur les features
- ✅ Support du dark mode
- ✅ TypeScript strict

## Installation

1. Clonez le repository
2. Installez les dépendances :

```bash
pnpm install
```

3. Configurez les variables d'environnement dans `.env.local` :

```bash
# URL publique du projet Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url

# Clé publique (anon) de Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clé de service Supabase (pour les opérations admin)
# ⚠️ ATTENTION: Cette clé donne un accès complet à votre base de données
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# URL du site (optionnel)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. Configurez votre base de données Supabase (voir section [Configuration Supabase](#configuration-supabase))

5. Lancez le serveur de développement :

```bash
pnpm dev
```

## Configuration Supabase

### 1. Création du projet Supabase

1. Créez un nouveau projet sur [Supabase](https://supabase.com)
2. Récupérez votre `URL` et `anon key` dans Settings > API
3. Récupérez votre `service_role key` dans Settings > API (⚠️ gardez-la secrète)

### 2. Configuration de la base de données

Exécutez ces requêtes SQL dans l'éditeur SQL de Supabase :

```sql
-- Créer la table des profils utilisateurs
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin', 'super_admin')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer une fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour promouvoir un utilisateur admin (utile pour le premier admin)
CREATE OR REPLACE FUNCTION promote_user_to_admin(user_email TEXT)
RETURNS VOID AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Trouver l'ID utilisateur par email
  SELECT id INTO user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur avec email % non trouvé', user_email;
  END IF;
  
  -- Mettre à jour ou créer le profil
  INSERT INTO user_profiles (id, role, is_active)
  VALUES (user_id, 'admin', true)
  ON CONFLICT (id) 
  DO UPDATE SET role = 'admin', is_active = true;
END;
$$ LANGUAGE plpgsql;
```

### 3. Politique de sécurité (RLS)

```sql
-- Activer RLS sur user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs puissent voir leur propre profil
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Politique pour que les utilisateurs puissent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Les admins peuvent tout voir et modifier (à implémenter selon vos besoins)
```

### 4. Créer votre premier admin

Après avoir créé un compte utilisateur via l'interface, exécutez cette fonction SQL pour le promouvoir admin :

```sql
SELECT promote_user_to_admin('votre-email@exemple.com');
```

## Fonctionnalités Admin

L'interface admin (`/admin`) permet de :

- 📋 Voir la liste des utilisateurs avec filtres
- ➕ Créer de nouveaux utilisateurs
- ✏️ Modifier les utilisateurs existants
- 🗑️ Supprimer des utilisateurs
- 🔄 Activer/désactiver des comptes
- 📊 Voir les analytics (à venir)

### Création d'utilisateurs

Pour que la création d'utilisateurs fonctionne via l'interface admin, vous devez :

1. Configurer `SUPABASE_SERVICE_ROLE_KEY` dans vos variables d'environnement
2. Cette clé permet de créer des utilisateurs côté serveur via l'Auth Admin API

**Alternative :** Si vous ne voulez pas utiliser la service role key, vous pouvez :
1. Créer des utilisateurs directement dans l'interface Supabase
2. Les promouvoir avec la fonction `promote_user_to_admin()`

## Architecture

Le projet utilise une architecture basée sur les features :

```
src/
├── features/
│   ├── auth/           # Authentification
│   ├── admin/          # Interface admin
│   ├── navigation/     # Navigation et sidebar
│   └── theme/          # Gestion du thème
├── app/                # App Router de Next.js
├── components/ui/      # Composants Shadcn/ui
└── lib/               # Utilitaires et configuration
```

## Scripts disponibles

```bash
pnpm dev          # Lancer en mode développement
pnpm build        # Build de production
pnpm start        # Lancer en production
pnpm lint         # Linter le code
```

## Technologies utilisées

- **Framework :** Next.js 15 (App Router)
- **Base de données :** Supabase (PostgreSQL)
- **Authentification :** Supabase Auth
- **UI :** Shadcn/ui + Tailwind CSS
- **Validation :** Zod
- **TypeScript :** Configuration stricte
- **State Management :** React hooks + Server Actions

## Déploiement

### Sur Vercel

1. Connectez votre repository à Vercel
2. Ajoutez les variables d'environnement dans les settings Vercel
3. Déployez

### Variables d'environnement de production

N'oubliez pas de configurer :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (pour la création d'utilisateurs admin)
- `NEXT_PUBLIC_SITE_URL` (votre domaine de production)

## Contribuer

1. Fork le projet
2. Créez votre feature branch (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add amazing feature'`)
4. Poussez vers la branch (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## Licence

Ce projet est sous licence MIT.
