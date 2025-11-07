"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"
import { formatDate } from "@/lib/utils"
import { Bell, Search, User, Mail, FileText } from "lucide-react"
import { motion } from "framer-motion"

interface Notificacao {
  id: number
  created_at: string
  cliente_id: number
  assunto: string
  conteudo: string
  status: string
  tipo: string | null
  clientes: {
    id: number
    nome: string
    email: string
    telefone: string | null
  } | null
}

const ITEMS_PER_PAGE = 20

export default function Notificacoes() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState("")
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadNotificacoes()
  }, [])

  async function loadNotificacoes(pageNum: number = 0, append: boolean = false) {
    try {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      const from = pageNum * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      const { data, error, count } = await supabase
        .from("registros_notificacao")
        .select(`
          *,
          clientes (
            id,
            nome,
            email,
            telefone
          )
        `, { count: 'exact' })
        .order("created_at", { ascending: false })
        .range(from, to)

      if (error) throw error

      if (append) {
        setNotificacoes(prev => [...prev, ...(data || [])])
      } else {
        setNotificacoes(data || [])
      }

      // Verificar se há mais itens
      const totalLoaded = (pageNum + 1) * ITEMS_PER_PAGE
      setHasMore((count || 0) > totalLoaded)
    } catch (error) {
      console.error("Erro ao carregar notificações:", error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && !search) {
      const nextPage = page + 1
      setPage(nextPage)
      loadNotificacoes(nextPage, true)
    }
  }, [page, loadingMore, hasMore, search])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [loadMore])

  const filteredNotificacoes = notificacoes.filter(notif =>
    notif.assunto?.toLowerCase().includes(search.toLowerCase()) ||
    notif.clientes?.nome?.toLowerCase().includes(search.toLowerCase()) ||
    notif.tipo?.toLowerCase().includes(search.toLowerCase()) ||
    notif.conteudo?.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower === "enviado" || statusLower === "concluído" || statusLower === "sucesso") return "success"
    if (statusLower === "erro" || statusLower === "falha") return "destructive"
    if (statusLower === "pendente") return "warning"
    return "secondary"
  }

  const getTipoIcon = (tipo: string | null) => {
    if (!tipo) return <FileText className="h-4 w-4" />
    const tipoLower = tipo.toLowerCase()
    if (tipoLower.includes("email")) return <Mail className="h-4 w-4" />
    if (tipoLower.includes("sms") || tipoLower.includes("whatsapp")) return <Bell className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  const stats = {
    total: notificacoes.length,
    enviados: notificacoes.filter(n => n.status.toLowerCase() === "enviado" || n.status.toLowerCase() === "concluído").length,
    pendentes: notificacoes.filter(n => n.status.toLowerCase() === "pendente").length,
    erros: notificacoes.filter(n => n.status.toLowerCase() === "erro" || n.status.toLowerCase() === "falha").length,
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Bell className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold tracking-tight">Notificações</h2>
            </div>
            <p className="text-muted-foreground mb-8">
              Registro de todas as notificações enviadas aos clientes
            </p>
          </motion.div>

          {/* Estatísticas */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Enviados</CardTitle>
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.enviados}</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendentes}</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Erros</CardTitle>
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.erros}</div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Busca */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por assunto, cliente, tipo ou conteúdo..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : filteredNotificacoes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  {search ? "Nenhuma notificação encontrada" : "Nenhuma notificação registrada ainda"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredNotificacoes.map((notif) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            {getTipoIcon(notif.tipo)}
                            <CardTitle className="text-lg">
                              {notif.assunto}
                            </CardTitle>
                          </div>
                          
                          {notif.clientes && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="h-4 w-4" />
                              <span className="font-medium">{notif.clientes.nome}</span>
                              {notif.clientes.email && (
                                <>
                                  <span>•</span>
                                  <Mail className="h-3 w-3" />
                                  <span>{notif.clientes.email}</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={getStatusColor(notif.status)}>
                            {notif.status}
                          </Badge>
                          {notif.tipo && (
                            <Badge variant="outline" className="text-xs">
                              {notif.tipo}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-1 text-muted-foreground">
                          Conteúdo
                        </p>
                        <p className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">
                          {notif.conteudo}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                        <span>ID: #{notif.id}</span>
                        <span>{formatDate(notif.created_at)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              
              {/* Infinite scroll trigger */}
              {!search && hasMore && (
                <div ref={observerTarget} className="flex items-center justify-center py-8">
                  {loadingMore && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span>Carregando mais...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
