-- Verifica se o usuário existe
SELECT * FROM public.users WHERE id = '9f65f981-4af1-4f74-971f-e1f15b4f9df3';

-- Se não existir, insere o usuário (ajuste os valores conforme necessário)
INSERT INTO public.users (id, email, name, password, instance, created_at)
SELECT 
    '9f65f981-4af1-4f74-971f-e1f15b4f9df3',
    'paulo.victor1012@gmail.com',
    'Paulo Victor da Silva Melo',
    -- Insira um hash bcrypt válido aqui
    '$2a$10$PLACEHOLDER_HASH',
    'instance_1748096048508',
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = '9f65f981-4af1-4f74-971f-e1f15b4f9df3'
);

-- Verifica a estrutura da tabela users
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name = 'users';

-- Verifica a estrutura da tabela contacts
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public' 
    AND table_name = 'contacts';

-- Verifica as constraints da tabela contacts
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
WHERE
    tc.table_name = 'contacts'; 