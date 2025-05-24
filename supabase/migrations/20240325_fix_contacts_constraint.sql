-- Remove a constraint antiga se existir
ALTER TABLE public.contacts
DROP CONSTRAINT IF EXISTS contacts_user_id_fkey;

-- Adiciona a constraint de chave estrangeira
ALTER TABLE public.contacts
ADD CONSTRAINT contacts_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.users(id)
ON DELETE CASCADE; 