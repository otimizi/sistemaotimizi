"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { formatDate } from "@/lib/utils"
import { MessageSquare, Search, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"

interface Comment {
  id: number
  created_at: string
  item_id: string | null
  pergunta_cliente: string | null
  resposta_ia: string | null
  item_titulo: string | null
  item_link: string | null
}

export default function Comentarios() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    loadComments()
  }, [])

  async function loadComments() {
    try {
      const { data, error } = await supabase
        .from("mercadolivre_registro_comentarios")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setComments(data || [])
    } catch (error) {
      console.error("Erro ao carregar comentários:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredComments = comments.filter(comment =>
    comment.item_titulo?.toLowerCase().includes(search.toLowerCase()) ||
    comment.pergunta_cliente?.toLowerCase().includes(search.toLowerCase())
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
              <MessageSquare className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold tracking-tight">Comentários Pré-Venda</h2>
            </div>
            <p className="text-muted-foreground mb-8">
              Histórico de perguntas e respostas da IA em produtos do Mercado Livre
            </p>
          </motion.div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por produto ou pergunta..."
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
          ) : filteredComments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  {search ? "Nenhum comentário encontrado" : "Nenhum comentário registrado ainda"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredComments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-1">
                            {comment.item_titulo || "Produto sem título"}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <span>{formatDate(comment.created_at)}</span>
                            {comment.item_link && (
                              <a
                                href={comment.item_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-primary hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Ver produto
                              </a>
                            )}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">IA</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-1 text-muted-foreground">
                          Pergunta do Cliente
                        </p>
                        <div className="bg-muted p-3 rounded-lg">
                          <p className="text-sm">
                            {comment.pergunta_cliente || "Sem pergunta registrada"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1 text-muted-foreground">
                          Resposta da IA
                        </p>
                        <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
                          <p className="text-sm">
                            {comment.resposta_ia || "Sem resposta registrada"}
                          </p>
                        </div>
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
