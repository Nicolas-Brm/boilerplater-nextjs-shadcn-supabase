-- Migration pour les paramètres système
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer la table system_settings si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Activer RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- 3. Politique RLS : seuls les admins peuvent accéder aux paramètres
CREATE POLICY "Only admins can access system settings" ON public.system_settings
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'moderator')
    AND is_active = true
  )
);

-- 4. Créer les paramètres par défaut s'ils n'existent pas
INSERT INTO public.system_settings (key, value) VALUES
  ('site_name', '"Boilerplate Next.js Pro"'),
  ('site_description', '"Une plateforme moderne et sécurisée construite avec Next.js 15, Supabase et Shadcn/UI. Parfait pour démarrer rapidement vos projets web avec authentification, gestion des utilisateurs et interface d''administration complète."'),
  ('allow_registration', 'true'),
  ('require_email_verification', 'true'),
  ('max_upload_size', '25'),
  ('maintenance_mode', 'false'),
  ('maintenance_message', '"Notre plateforme est temporairement en maintenance pour améliorer votre expérience. Nous serons de retour très bientôt ! Merci de votre patience."'),
  ('app_version', '"1.2.3"'),
  ('company_name', '"Boilerplate Solutions"')
ON CONFLICT (key) DO NOTHING;

-- 5. Mettre à jour les valeurs existantes si elles contiennent des guillemets échappés problématiques
UPDATE public.system_settings 
SET value = '"Boilerplate Next.js Pro"' 
WHERE key = 'site_name' AND value = '"\\"\\"\\"Boilerplate Next.js Pro\\"\\"\\""';

UPDATE public.system_settings 
SET value = '"Une plateforme moderne et sécurisée construite avec Next.js 15, Supabase et Shadcn/UI. Parfait pour démarrer rapidement vos projets web avec authentification, gestion des utilisateurs et interface d''administration complète."' 
WHERE key = 'site_description' AND (value = '""' OR value::text LIKE '%\\"%');

UPDATE public.system_settings 
SET value = '"Notre plateforme est temporairement en maintenance pour améliorer votre expérience. Nous serons de retour très bientôt ! Merci de votre patience."' 
WHERE key = 'maintenance_message' AND value = '""';

-- 6. Créer la table activity_logs si elle n'existe pas (pour les logs d'audit)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id TEXT,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Activer RLS sur activity_logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 8. Politique RLS pour activity_logs : seuls les admins peuvent voir les logs
CREATE POLICY "Only admins can view activity logs" ON public.activity_logs
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'moderator')
    AND is_active = true
  )
);

-- 9. Seuls les admins peuvent insérer des logs
CREATE POLICY "Only admins can insert activity logs" ON public.activity_logs
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin', 'moderator')
    AND is_active = true
  )
);

-- 10. Créer un trigger pour mettre à jour updated_at sur system_settings
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 11. Créer des index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON public.system_settings(key);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);

-- 12. Commentaires sur les tables pour documentation
COMMENT ON TABLE public.system_settings IS 'Paramètres de configuration système de l''application';
COMMENT ON TABLE public.activity_logs IS 'Logs d''audit des actions administratives';

COMMENT ON COLUMN public.system_settings.key IS 'Clé unique du paramètre (ex: site_name, maintenance_mode)';
COMMENT ON COLUMN public.system_settings.value IS 'Valeur du paramètre stockée en JSON';
COMMENT ON COLUMN public.system_settings.updated_by IS 'ID de l''utilisateur ayant modifié le paramètre';

COMMENT ON COLUMN public.activity_logs.action IS 'Type d''action effectuée (ex: CREATE_USER, UPDATE_SETTINGS)';
COMMENT ON COLUMN public.activity_logs.resource IS 'Type de ressource concernée (ex: user, system)';
COMMENT ON COLUMN public.activity_logs.resource_id IS 'ID de la ressource spécifique (optionnel)';
COMMENT ON COLUMN public.activity_logs.metadata IS 'Données additionnelles sur l''action (JSON)'; 