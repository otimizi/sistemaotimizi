"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { MessageSquare, Search, Bot, User, Calendar, Mail } from "lucide-react"
import { motion } from "framer-motion"
import { formatDate } from "@/lib/utils"

interface Message {
  type: string
  content: string
  additional_kwargs?: Record<string, any>
  response_metadata?: Record<string, any>
  tool_calls?: any[]
  invalid_tool_calls?: any[]
}

interface ChatHistory {
  id: number
  session_id: string | null
  message: Message | null
}

interface Cliente {
  id: number
  nome: string | null
  email: string | null
  telefone: string | null
  setor_atual: string | null
  cpf_cnpj: string | null
  cidade: string | null
  estado: string | null
}

interface ClienteStats {
  notificacoes: number
  comentarios: number
  pedidos: number
}

interface GroupedConversation {
  session_id: string
  messages: ChatHistory[]
  firstMessage: Date
  messageCount: number
  cliente: Cliente | null
  agente: string
}

export default function Conversas() {
  const [conversations, setConversations] = useState<GroupedConversation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [clienteStats, setClienteStats] = useState<ClienteStats | null>(null)
  const [showClienteCard, setShowClienteCard] = useState(false)

  useEffect(() => {
    loadConversations()
  }, [])

  async function loadConversations() {
    try {
      // Buscar todas as mensagens
      const { data: chatData, error: chatError } = await supabase
        .from("n8n_chat_histories")
        .select("*")
        .order("id", { ascending: true })

      if (chatError) throw chatError

      // Buscar todos os clientes
      const { data: clientesData, error: clientesError } = await supabase
        .from("clientes")
        .select("id, nome, email, telefone, setor_atual, cpf_cnpj, cidade, estado")

      if (clientesError) throw clientesError

      // Criar mapa de telefone -> cliente
      const clientesMap = new Map<string, Cliente>()
      clientesData?.forEach(cliente => {
        if (cliente.telefone) {
          // Normalizar telefone removendo caracteres especiais
          const telefoneNormalizado = cliente.telefone.replace(/\D/g, '')
          clientesMap.set(telefoneNormalizado, cliente as Cliente)
        }
      })

      // Agrupar mensagens por session_id e associar cliente
      const grouped = (chatData || []).reduce((acc, item) => {
        const sessionId = item.session_id || "sem-sessao"
        
        if (!acc[sessionId]) {
          // Tentar encontrar cliente pelo telefone (session_id)
          const telefoneNormalizado = sessionId.replace(/\D/g, '')
          const cliente = clientesMap.get(telefoneNormalizado) || null
          const agente = cliente?.setor_atual || "Geral"
          
          acc[sessionId] = {
            session_id: sessionId,
            messages: [],
            firstMessage: new Date(),
            messageCount: 0,
            cliente,
            agente
          }
        }
        
        acc[sessionId].messages.push(item)
        acc[sessionId].messageCount++
        
        return acc
      }, {} as Record<string, GroupedConversation>)

      // Converter para array e ordenar por mais recente
      const conversationsArray = Object.values(grouped) as GroupedConversation[]
      conversationsArray.sort((a, b) => 
        b.messages[b.messages.length - 1]?.id - a.messages[a.messages.length - 1]?.id
      )

      setConversations(conversationsArray)
      
      // Selecionar primeira conversa automaticamente
      if (conversationsArray.length > 0 && !selectedSession) {
        setSelectedSession(conversationsArray[0].session_id)
      }
    } catch (error) {
      console.error("Erro ao carregar conversas:", error)
    } finally {
      setLoading(false)
    }
  }

  async function loadClienteStats(clienteId: number) {
    try {
      // Buscar notificações
      const { count: notifCount } = await supabase
        .from("registros_notificacao")
        .select("*", { count: 'exact', head: true })
        .eq("cliente_id", clienteId)

      // Buscar comentários
      const { count: comentCount } = await supabase
        .from("mercadolivre_registro_comentarios")
        .select("*", { count: 'exact', head: true })

      // Buscar pedidos pós-venda
      const { count: pedidosCount } = await supabase
        .from("mercadolivre_registro_msgposvenda")
        .select("*", { count: 'exact', head: true })

      setClienteStats({
        notificacoes: notifCount || 0,
        comentarios: comentCount || 0,
        pedidos: pedidosCount || 0
      })
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error)
    }
  }

  function handleClienteClick(cliente: Cliente) {
    setSelectedCliente(cliente)
    setShowClienteCard(true)
    loadClienteStats(cliente.id)
  }

  const filteredConversations = conversations.filter(conv => {
    if (!search) return true
    
    const searchLower = search.toLowerCase()
    return conv.session_id.toLowerCase().includes(searchLower) ||
      conv.cliente?.nome?.toLowerCase().includes(searchLower) ||
      conv.messages.some(msg => 
        msg.message?.content?.toLowerCase().includes(searchLower)
      )
  })

  const selectedConversation = conversations.find(c => c.session_id === selectedSession)

  const getMessageIcon = (type: string) => {
    return type === "human" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />
  }

  const stats = {
    total: conversations.length,
    messages: conversations.reduce((acc, conv) => acc + conv.messageCount, 0),
    avgMessages: conversations.length > 0 
      ? Math.round(conversations.reduce((acc, conv) => acc + conv.messageCount, 0) / conversations.length)
      : 0
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-hidden flex">
        {/* Lista de Conversas - Sidebar Esquerdo */}
        <div className="w-80 border-r flex flex-col bg-muted/20">
          <div className="p-6 border-b">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Conversas</h2>
              </div>
              
              {/* Stats Compactos */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold">{stats.total}</div>
                  <div className="text-xs text-muted-foreground">Conversas</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{stats.messages}</div>
                  <div className="text-xs text-muted-foreground">Mensagens</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{stats.avgMessages}</div>
                  <div className="text-xs text-muted-foreground">Média</div>
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar conversas..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </motion.div>
          </div>

          {/* Lista de Conversas */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground text-sm">Carregando...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm text-center">
                  {search ? "Nenhuma conversa encontrada" : "Nenhuma conversa registrada"}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv, index) => (
                <motion.div
                  key={conv.session_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedSession === conv.session_id 
                        ? 'border-primary shadow-sm' 
                        : ''
                    }`}
                    onClick={() => setSelectedSession(conv.session_id)}
                  >
                    <CardHeader className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm truncate">
                            {conv.cliente?.nome || `Tel: ${conv.session_id.substring(0, 12)}...`}
                          </CardTitle>
                          <CardDescription className="text-xs mt-1 space-y-1">
                            <div className="flex items-center gap-1">
                              <Bot className="h-3 w-3" />
                              <span>Agente: {conv.agente}</span>
                            </div>
                            <div>{conv.messageCount} mensagens</div>
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-1">
                          {conv.cliente && (
                            <Badge variant="outline" className="text-xs">
                              <User className="h-3 w-3 mr-1" />
                              Cliente
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {conv.messages.filter(m => m.message?.type === "ai").length} IA
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Área de Mensagens - Direita */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Header da Conversa */}
              <div className="p-6 border-b bg-muted/20">
                <div className="flex items-center justify-between">
                  <div>
                    {selectedConversation.cliente ? (
                      <div>
                        <h3 
                          className="text-xl font-bold cursor-pointer hover:text-primary transition-colors flex items-center gap-2"
                          onClick={() => handleClienteClick(selectedConversation.cliente!)}
                        >
                          {selectedConversation.cliente.nome}
                          <User className="h-5 w-5" />
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4" />
                            <span>Agente: <strong>{selectedConversation.agente}</strong></span>
                          </div>
                          <div>{selectedConversation.messageCount} mensagens na conversa</div>
                        </p>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-xl font-bold">
                          Telefone: {selectedConversation.session_id}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Bot className="h-4 w-4" />
                            <span>Agente: <strong>{selectedConversation.agente}</strong></span>
                          </div>
                          {selectedConversation.messageCount} mensagens • Cliente não identificado
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      <User className="h-3 w-3 mr-1" />
                      {selectedConversation.messages.filter(m => m.message?.type === "human").length}
                    </Badge>
                    <Badge variant="outline">
                      <Bot className="h-3 w-3 mr-1" />
                      {selectedConversation.messages.filter(m => m.message?.type === "ai").length}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {selectedConversation.messages.map((msg, index) => {
                  const isHuman = msg.message?.type === "human"
                  const content = msg.message?.content || "Mensagem sem conteúdo"
                  const clienteName = selectedConversation.cliente?.nome || "Cliente"
                  
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`flex ${isHuman ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] ${isHuman ? 'order-2' : 'order-1'}`}>
                        <div className={`flex items-center gap-2 mb-1 ${isHuman ? 'justify-end' : 'justify-start'}`}>
                          {!isHuman && (
                            <>
                              <Bot className="h-4 w-4 text-primary" />
                              <span className="text-xs font-medium text-primary">
                                SOIA - {selectedConversation.agente}
                              </span>
                            </>
                          )}
                          {isHuman && (
                            <>
                              <span className="text-xs font-medium text-muted-foreground">
                                {clienteName}
                              </span>
                              <User className="h-4 w-4 text-muted-foreground" />
                            </>
                          )}
                        </div>
                        <Card className={isHuman ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                          <CardContent className="p-4">
                            <p className="text-sm whitespace-pre-wrap">{content}</p>
                          </CardContent>
                        </Card>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">Selecione uma conversa</h3>
                <p className="text-muted-foreground">
                  Escolha uma conversa à esquerda para ver o histórico completo
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Card Lateral do Cliente */}
        {showClienteCard && selectedCliente && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-96 border-l bg-card overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{selectedCliente.nome}</h3>
                  <p className="text-sm text-muted-foreground mt-1">Informações do Cliente</p>
                </div>
                <button
                  onClick={() => setShowClienteCard(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Dados Pessoais */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dados Pessoais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedCliente.email && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Email</p>
                      <p className="text-sm font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {selectedCliente.email}
                      </p>
                    </div>
                  )}
                  
                  {selectedCliente.telefone && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Telefone</p>
                      <p className="text-sm font-medium">{selectedCliente.telefone}</p>
                    </div>
                  )}

                  {selectedCliente.cpf_cnpj && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">CPF/CNPJ</p>
                      <p className="text-sm font-medium">{selectedCliente.cpf_cnpj}</p>
                    </div>
                  )}

                  {(selectedCliente.cidade || selectedCliente.estado) && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Localização</p>
                      <p className="text-sm font-medium">
                        {selectedCliente.cidade}{selectedCliente.cidade && selectedCliente.estado ? ', ' : ''}{selectedCliente.estado}
                      </p>
                    </div>
                  )}

                  {selectedCliente.setor_atual && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Setor Atual</p>
                      <Badge variant="outline" className="text-sm">
                        <Bot className="h-3 w-3 mr-1" />
                        {selectedCliente.setor_atual}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Estatísticas */}
              {clienteStats && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Estatísticas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">{clienteStats.notificacoes}</div>
                        <div className="text-xs text-muted-foreground mt-1">Notificações</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">{clienteStats.comentarios}</div>
                        <div className="text-xs text-muted-foreground mt-1">Comentários</div>
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{clienteStats.pedidos}</div>
                      <div className="text-xs text-muted-foreground mt-1">Pedidos Pós-Venda</div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Informações Adicionais */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações do Sistema</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID do Cliente:</span>
                    <span className="font-medium">#{selectedCliente.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Agente Atribuído:</span>
                    <Badge variant="secondary">{selectedCliente.setor_atual || "Não atribuído"}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
