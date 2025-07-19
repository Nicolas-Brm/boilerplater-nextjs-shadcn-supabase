-- Migration pour permettre l'accès public aux paramètres système de base
-- À exécuter dans l'éditeur SQL de Supabase après la migration principale

-- 1. Ajouter une politique de lecture publique pour les paramètres spécifiques
CREATE POLICY "Public read access for basic settings" ON public.system_settings
FOR SELECT USING (
  key IN ('site_name', 'site_description', 'app_version', 'company_name')
);

-- 2. Cette politique permet à tous les utilisateurs (même non connectés) 
-- de lire seulement les paramètres publics essentiels comme le nom du site

-- Note: La politique existante "Only admins can access system settings" 
-- reste active pour toutes les autres opérations (INSERT, UPDATE, DELETE)
-- et pour tous les autres paramètres système 