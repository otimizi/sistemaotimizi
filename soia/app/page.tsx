"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { formatDate } from "@/lib/utils"
import { AuthGuard } from "@/components/auth-guard"
import {
  MessageSquare,
  ShoppingCart,
  Bell,
  Users,
  TrendingUp,
  Activity,
} from "lucide-react"
import { motion } from "framer-motion"

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalComentarios: 0,
    totalPosVenda: 0,
    totalNotificacoes: 0,
    totalClientes: 0,
  })
  const [recentComments, setRecentComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    try {
      // Carregar estatísticas
      const [comentarios, posVenda, notificacoes, clientes] = await Promise.all([
        supabase.from("mercadolivre_registro_comentarios").select("*", { count: "exact", head: true }),
        supabase.from("mercadolivre_registro_msgposvenda").select("*", { count: "exact", head: true }),
        supabase.from("registro_notificacao_mercadolivre").select("*", { count: "exact", head: true }),
        supabase.from("clientes").select("*", { count: "exact", head: true }),
      ])

      setStats({
        totalComentarios: comentarios.count || 0,
        totalPosVenda: posVenda.count || 0,
        totalNotificacoes: notificacoes.count || 0,
        totalClientes: clientes.count || 0,
      })

      // Carregar comentários recentes
      const { data: comments } = await supabase
        .from("mercadolivre_registro_comentarios")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)

      setRecentComments(comments || [])
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
          <div className="p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Dashboard</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
              Visão geral do sistema de monitoramento da IA
            </p>
          </motion.div>

          {/* Cards de Estatísticas */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard
              title="Comentários Respondidos"
              value={stats.totalComentarios}
              description="Interações pré-venda"
              icon={MessageSquare}
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              title="Mensagens Pós-Venda"
              value={stats.totalPosVenda}
              description="Comunicações enviadas"
              icon={ShoppingCart}
              trend={{ value: 8, isPositive: true }}
            />
            <StatCard
              title="Notificações"
              value={stats.totalNotificacoes}
              description="Total de notificações"
              icon={Bell}
              trend={{ value: 3, isPositive: false }}
            />
            <StatCard
              title="Clientes Ativos"
              value={stats.totalClientes}
              description="Cadastrados no sistema"
              icon={Users}
              trend={{ value: 15, isPositive: true }}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Atividade Recente */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Atividade Recente
                </CardTitle>
                <CardDescription>
                  Últimas interações da IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <p className="text-sm text-muted-foreground">Carregando...</p>
                  ) : recentComments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma atividade recente
                    </p>
                  ) : (
                    recentComments.map((comment, index) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex flex-col space-y-2 border-b pb-3 last:border-0"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium line-clamp-1">
                              {comment.item_titulo || "Sem título"}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {comment.pergunta_cliente || "Sem pergunta"}
                            </p>
                          </div>
                          <Badge variant="secondary" className="ml-2">
                            IA
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(comment.created_at)}
                        </p>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Performance */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance
                </CardTitle>
                <CardDescription>
                  Métricas do agente de IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="today">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="today">Hoje</TabsTrigger>
                    <TabsTrigger value="week">Semana</TabsTrigger>
                    <TabsTrigger value="month">Mês</TabsTrigger>
                  </TabsList>
                  <TabsContent value="today" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Taxa de Resposta</span>
                        <span className="font-medium">98%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-[98%]" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tempo Médio</span>
                        <span className="font-medium">1.2s</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[85%]" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Satisfação</span>
                        <span className="font-medium">95%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 w-[95%]" />
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="week" className="space-y-4 mt-4">
                    <p className="text-sm text-muted-foreground">
                      Dados da semana serão exibidos aqui
                    </p>
                  </TabsContent>
                  <TabsContent value="month" className="space-y-4 mt-4">
                    <p className="text-sm text-muted-foreground">
                      Dados do mês serão exibidos aqui
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      </div>
    </AuthGuard>
  )
}
