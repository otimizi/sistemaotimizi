"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { MessageSquare, Search, Bot, User, Calendar, Mail, X, ArrowLeft, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

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
  data_registro: string
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

const CONVERSATIONS_PER_PAGE = 15

export default function Conversas() {
  const [conversations, setConversations] = useState<GroupedConversation[]>([])
  const [allConversations, setAllConversations] = useState<GroupedConversation[]>([])
  const [displayedCount, setDisplayedCount] = useState(CONVERSATIONS_PER_PAGE)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [clienteStats, setClienteStats] = useState<ClienteStats | null>(null)
  const [showClienteCard, setShowClienteCard] = useState(false)
  const [dateFilter, setDateFilter] = useState<Date | null>(null)
  const [showDateFilter, setShowDateFilter] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)

  const loadConversations = useCallback(async () => {
    setLoading(true)
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
      clientesData?.forEach((cliente: any) => {
        if (cliente.telefone) {
          // Normalizar telefone removendo caracteres especiais
          const telefoneNormalizado = cliente.telefone.replace(/\D/g, '')
          clientesMap.set(telefoneNormalizado, cliente as Cliente)
        }
      })

      // Agrupar mensagens por session_id e associar cliente
      const grouped = (chatData || []).reduce((acc, item: any) => {
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

      // Converter para array e ordenar por mensagem mais recente
      const conversationsArray = Object.values(grouped).map((conversation) => {
        const sortedMessages = [...conversation.messages].sort((a, b) => {
          const dateA = a.data_registro ? new Date(a.data_registro).getTime() : 0
          const dateB = b.data_registro ? new Date(b.data_registro).getTime() : 0
          return dateA - dateB
        })

        const firstMessageDate = sortedMessages[0]?.data_registro

        return {
          ...conversation,
          messages: sortedMessages,
          firstMessage: firstMessageDate ? new Date(firstMessageDate) : new Date(0)
        }
      }) as GroupedConversation[]

      const getLastMessageTimestamp = (conv: GroupedConversation) => {
        const lastMessage = conv.messages[conv.messages.length - 1]
        if (!lastMessage?.data_registro) return 0
        return new Date(lastMessage.data_registro).getTime()
      }

      conversationsArray.sort((a, b) => getLastMessageTimestamp(b) - getLastMessageTimestamp(a))

      setAllConversations(conversationsArray)
      setConversations(conversationsArray.slice(0, CONVERSATIONS_PER_PAGE))
      setDisplayedCount(CONVERSATIONS_PER_PAGE)
      setHasMore(conversationsArray.length > CONVERSATIONS_PER_PAGE)

      // Selecionar primeira conversa automaticamente ou manter seleção atual
      setSelectedSession((prevSelected) => {
        if (prevSelected && conversationsArray.some(conv => conv.session_id === prevSelected)) {
          return prevSelected
        }

        return conversationsArray.length > 0 ? conversationsArray[0].session_id : null
      })
    } catch (error) {
      console.error("Erro ao carregar conversas:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  const handleRefresh = useCallback(async () => {
    if (refreshing) return
    setRefreshing(true)
    try {
      await loadConversations()
    } finally {
      setRefreshing(false)
    }
  }, [loadConversations, refreshing])

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && !search && !dateFilter) {
      setLoadingMore(true)
      setTimeout(() => {
        const nextCount = displayedCount + CONVERSATIONS_PER_PAGE
        setConversations(allConversations.slice(0, nextCount))
        setDisplayedCount(nextCount)
        setHasMore(nextCount < allConversations.length)
        setLoadingMore(false)
      }, 300)
    }
  }, [loadingMore, hasMore, search, dateFilter, displayedCount, allConversations])

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

  const baseConversations = search || dateFilter ? allConversations : conversations

  const filteredConversations = baseConversations.filter(conv => {
    // Filtro de busca por texto
    if (search) {
      const searchLower = search.toLowerCase()
      const matchesSearch = conv.session_id.toLowerCase().includes(searchLower) ||
        conv.cliente?.nome?.toLowerCase().includes(searchLower) ||
        conv.messages.some(msg => 
          msg.message?.content?.toLowerCase().includes(searchLower)
        )
      if (!matchesSearch) return false
    }
    
    // Filtro por data
    if (dateFilter) {
      const filterDate = format(dateFilter, 'yyyy-MM-dd')
      const hasMessageOnDate = conv.messages.some(msg => {
        if (!msg.data_registro) return false
        const msgDate = format(new Date(msg.data_registro), 'yyyy-MM-dd')
        return msgDate === filterDate
      })
      if (!hasMessageOnDate) return false
    }
    
    return true
  })

  const selectedConversation = allConversations.find(c => c.session_id === selectedSession)

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
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex pt-16 lg:pt-0 overflow-hidden">
        {/* Lista de Conversas - Sidebar Esquerdo */}
        <div className={cn(
          "w-full lg:w-80 border-r flex flex-col bg-muted/20 h-full",
          selectedSession && "hidden lg:flex"
        )}>
          <div className="p-4 sm:p-6 border-b flex-shrink-0">
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

              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar conversas..."
                      className="pl-9"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={loading || refreshing}
                    aria-label="Atualizar conversas"
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                  </Button>
                </div>
                
                {/* Filtro de Data */}
                <div className="flex gap-2">
                  <Button
                    variant={showDateFilter ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setShowDateFilter(!showDateFilter)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {dateFilter ? format(dateFilter, "dd/MM/yyyy", { locale: ptBR }) : "Filtrar por data"}
                  </Button>
                  {dateFilter && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDateFilter(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {/* Seletor de Data */}
                {showDateFilter && (
                  <Card className="p-3">
                    <div className="space-y-2">
                      <Input
                        type="date"
                        value={dateFilter ? format(dateFilter, 'yyyy-MM-dd') : ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            setDateFilter(new Date(e.target.value))
                          } else {
                            setDateFilter(null)
                          }
                        }}
                        className="w-full"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setDateFilter(new Date())}
                        >
                          Hoje
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            const yesterday = new Date()
                            yesterday.setDate(yesterday.getDate() - 1)
                            setDateFilter(yesterday)
                          }}
                        >
                          Ontem
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
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
            
            {/* Infinite scroll trigger */}
            {!loading && !search && !dateFilter && hasMore && (
              <div ref={observerTarget} className="flex items-center justify-center py-4">
                {loadingMore && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>Carregando mais conversas...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Área de Mensagens - Direita */}
        <div className={cn(
          "flex-1 flex flex-col h-full",
          !selectedSession && "hidden lg:flex"
        )}>
          {selectedConversation ? (
            <>
              {/* Header da Conversa */}
              <div className="p-4 sm:p-6 border-b bg-muted/20 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={() => setSelectedSession(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="flex-1 flex items-center justify-between">
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
                            {msg.data_registro && (
                              <p className={`text-xs mt-2 flex items-center gap-1 ${
                                isHuman ? 'text-primary-foreground/70' : 'text-muted-foreground'
                              }`}>
                                <Calendar className="h-3 w-3" />
                                {format(new Date(msg.data_registro), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </p>
                            )}
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
