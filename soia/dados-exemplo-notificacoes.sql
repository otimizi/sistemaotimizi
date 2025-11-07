-- ========================================
-- DADOS DE EXEMPLO para registros_notificacao
-- ========================================
-- Execute este SQL no Supabase se a tabela estiver vazia

-- Inserir algumas notificações de exemplo
-- Certifique-se de usar IDs de clientes que existam na sua tabela

-- Notificação de boas-vindas
INSERT INTO public.registros_notificacao (cliente_id, assunto, conteudo, status, tipo)
SELECT 
  267,
  'Boas-vindas à nossa plataforma',
  'Olá! Bem-vindo(a) à nossa plataforma. Estamos felizes em tê-lo(a) conosco. Se precisar de ajuda, nossa equipe está sempre disponível.',
  'enviado',
  'email'
WHERE EXISTS (SELECT 1 FROM public.clientes WHERE id = 267);

-- Notificação de pedido
INSERT INTO public.registros_notificacao (cliente_id, assunto, conteudo, status, tipo)
SELECT 
  267,
  'Seu pedido foi confirmado',
  'Seu pedido #2000123456 foi confirmado e está sendo processado. Você receberá atualizações sobre o envio em breve.',
  'enviado',
  'whatsapp'
WHERE EXISTS (SELECT 1 FROM public.clientes WHERE id = 267);

-- Notificação pendente
INSERT INTO public.registros_notificacao (cliente_id, assunto, conteudo, status, tipo)
SELECT 
  267,
  'Atualização do seu pedido',
  'Seu pedido está a caminho! Previsão de entrega: 2-3 dias úteis.',
  'pendente',
  'sms'
WHERE EXISTS (SELECT 1 FROM public.clientes WHERE id = 267);

-- Notificação de entrega
INSERT INTO public.registros_notificacao (cliente_id, assunto, conteudo, status, tipo)
SELECT 
  c.id,
  'Pedido entregue com sucesso',
  'Seu pedido foi entregue. Esperamos que esteja satisfeito(a) com sua compra!',
  'enviado',
  'email'
FROM public.clientes c
WHERE c.setor_atual = 'secretaria'
LIMIT 1;

-- Notificação de erro (exemplo)
INSERT INTO public.registros_notificacao (cliente_id, assunto, conteudo, status, tipo)
SELECT 
  c.id,
  'Problema com o envio',
  'Detectamos um problema com o envio do seu pedido. Nossa equipe já está trabalhando para resolver.',
  'erro',
  'email'
FROM public.clientes c
LIMIT 1;

-- Verificar os dados inseridos
SELECT 
  rn.id,
  rn.assunto,
  rn.status,
  rn.tipo,
  c.nome as cliente_nome,
  rn.created_at
FROM public.registros_notificacao rn
LEFT JOIN public.clientes c ON c.id = rn.cliente_id
ORDER BY rn.created_at DESC
LIMIT 10;
