"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"

interface TabelaStatus {
  nome: string
  existe: boolean
  registros: number | null
  erro: string | null
}

export default function Diagnostico() {
  const [status, setStatus] = useState<TabelaStatus[]>([])
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState({
    url: '',
    keyPreview: ''
  })

  useEffect(() => {
    // Verificar config
    setConfig({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NÃO DEFINIDA',
      keyPreview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
        ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...`
        : 'NÃO DEFINIDA'
    })
    
    testarTabelas()
  }, [])

  async function testarTabelas() {
    setLoading(true)
    const tabelas = [
      'gerenciamento_ai',
      'clientes',
      'mercadolivre_produtos',
      'mercadolivre_registro_comentarios',
      'mercadolivre_registro_msgposvenda',
      'registro_notificacao_mercadolivre',
      'registros_notificacao',
      'n8n_chat_histories',
    ]

    const resultados: TabelaStatus[] = []

    for (const tabela of tabelas) {
      try {
        const { data, error, count } = await supabase
          .from(tabela)
          .select('*', { count: 'exact', head: true })

        resultados.push({
          nome: tabela,
          existe: !error,
          registros: count,
          erro: error?.message || null
        })
      } catch (e: any) {
        resultados.push({
          nome: tabela,
          existe: false,
          registros: null,
          erro: e.message
        })
      }
    }

    setStatus(resultados)
    setLoading(false)
  }

  const getStatusIcon = (tabela: TabelaStatus) => {
    if (!tabela.existe) return <XCircle className="h-5 w-5 text-red-600" />
    if (tabela.registros === 0) return <AlertCircle className="h-5 w-5 text-yellow-600" />
    return <CheckCircle className="h-5 w-5 text-green-600" />
  }

  const getStatusBadge = (tabela: TabelaStatus) => {
    if (!tabela.existe) return <Badge variant="destructive">Não existe</Badge>
    if (tabela.registros === 0) return <Badge variant="warning">Vazia</Badge>
    return <Badge variant="success">{tabela.registros} registros</Badge>
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🔧 Diagnóstico do Sistema</h1>
          <p className="text-muted-foreground">
            Verificação da conexão e estado das tabelas do Supabase
          </p>
        </div>

        {/* Configuração */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Configuração</CardTitle>
            <CardDescription>Variáveis de ambiente carregadas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium mb-1">NEXT_PUBLIC_SUPABASE_URL</p>
              <p className="text-sm font-mono bg-muted p-2 rounded">{config.url}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
              <p className="text-sm font-mono bg-muted p-2 rounded">{config.keyPreview}</p>
            </div>
          </CardContent>
        </Card>

        {/* Botão de Refresh */}
        <div className="mb-6">
          <Button onClick={testarTabelas} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Testando...' : 'Testar Novamente'}
          </Button>
        </div>

        {/* Status das Tabelas */}
        <Card>
          <CardHeader>
            <CardTitle>Status das Tabelas</CardTitle>
            <CardDescription>Verificação de existência e conteúdo</CardDescription>
          </CardHeader>
          <CardContent>
            {status.length === 0 && !loading ? (
              <p className="text-muted-foreground">Clique em &quot;Testar Novamente&quot; para verificar</p>
            ) : (
              <div className="space-y-3">
                {status.map((tabela) => (
                  <div key={tabela.nome} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(tabela)}
                      <div>
                        <p className="font-medium">{tabela.nome}</p>
                        {tabela.erro && (
                          <p className="text-xs text-red-600 mt-1">{tabela.erro}</p>
                        )}
                      </div>
                    </div>
                    {getStatusBadge(tabela)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recomendações */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex gap-2">
              <span className="font-bold text-red-600">❌</span>
              <div>
                <span className="font-medium">Tabela não existe:</span> Crie a tabela no Supabase SQL Editor
              </div>
            </div>
            <div className="flex gap-2">
              <span className="font-bold text-yellow-600">⚠️</span>
              <div>
                <span className="font-medium">Tabela vazia:</span> Insira alguns dados de teste
              </div>
            </div>
            <div className="flex gap-2">
              <span className="font-bold text-green-600">✅</span>
              <div>
                <span className="font-medium">Tudo OK:</span> Tabela existe e contém dados
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
