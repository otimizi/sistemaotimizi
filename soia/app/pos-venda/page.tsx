"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { formatDate } from "@/lib/utils"
import { ShoppingCart, Search, CheckCircle, XCircle } from "lucide-react"
import { motion } from "framer-motion"

interface PosVenda {
  id: number
  created_at: string
  order_id: string | null
  pack_id: string | null
  status_envio: boolean | null
}

export default function PosVenda() {
  const [mensagens, setMensagens] = useState<PosVenda[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [stats, setStats] = useState({
    enviados: 0,
    pendentes: 0,
  })

  useEffect(() => {
    loadMensagens()
  }, [])

  async function loadMensagens() {
    try {
      const { data, error } = await (supabase as any)
        .from("mercadolivre_registro_msgposvenda")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      
      const mensagensData = data || []
      setMensagens(mensagensData)

      // Calcular estatísticas
      const enviados = mensagensData.filter((m: any) => m.status_envio === true).length
      const pendentes = mensagensData.filter((m: any) => m.status_envio === false || m.status_envio === null).length
      
      setStats({ enviados, pendentes })
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMensagens = mensagens.filter(msg =>
    msg.order_id?.toLowerCase().includes(search.toLowerCase()) ||
    msg.pack_id?.toLowerCase().includes(search.toLowerCase())
  )

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
              <ShoppingCart className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold tracking-tight">Mensagens Pós-Venda</h2>
            </div>
            <p className="text-muted-foreground mb-8">
              Comunicações enviadas após aprovação de pedidos
            </p>
          </motion.div>

          {/* Cards de Estatísticas */}
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Mensagens Enviadas</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.enviados}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Comunicações bem sucedidas
                  </p>
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
                  <CardTitle className="text-sm font-medium">Pendentes/Falhas</CardTitle>
                  <XCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendentes}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Aguardando envio ou com erro
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por ordem ou pacote..."
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
          ) : filteredMensagens.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  {search ? "Nenhuma mensagem encontrada" : "Nenhuma mensagem registrada ainda"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredMensagens.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            Pedido #{msg.order_id || "N/A"}
                            {msg.status_envio ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600" />
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Pacote: {msg.pack_id || "N/A"}
                          </CardDescription>
                        </div>
                        <Badge variant={msg.status_envio ? "success" : "destructive"}>
                          {msg.status_envio ? "Enviado" : "Pendente"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Data de Registro</span>
                        <span className="font-medium">{formatDate(msg.created_at)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
