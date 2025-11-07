// Script de teste para verificar conexão com Supabase
// Execute com as variáveis de ambiente:
// NEXT_PUBLIC_SUPABASE_URL=sua_url NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_key node scripts/teste-conexao.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testando conexão com Supabase...\n');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NÃO DEFINIDA');
console.log('\n---\n');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testarConexao() {
  console.log('Testando tabelas...\n');

  // Testar cada tabela
  const tabelas = [
    'gerenciamento_ai',
    'clientes',
    'mercadolivre_produtos',
    'mercadolivre_registro_comentarios',
    'mercadolivre_registro_msgposvenda',
    'registro_notificacao_mercadolivre',
  ];

  for (const tabela of tabelas) {
    try {
      const { data, error, count } = await supabase
        .from(tabela)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${tabela}: ERRO - ${error.message}`);
      } else {
        console.log(`✅ ${tabela}: ${count || 0} registros`);
      }
    } catch (e) {
      console.log(`❌ ${tabela}: ERRO - ${e.message}`);
    }
  }

  console.log('\n---\n');
  
  // Tentar buscar dados de gerenciamento_ai
  console.log('Buscando dados de gerenciamento_ai...\n');
  const { data, error } = await supabase
    .from('gerenciamento_ai')
    .select('*');

  if (error) {
    console.error('❌ Erro:', error);
  } else if (!data || data.length === 0) {
    console.log('⚠️  Tabela existe mas está vazia');
  } else {
    console.log('✅ Dados encontrados:', data);
  }
}

testarConexao();
