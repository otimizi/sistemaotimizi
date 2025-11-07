"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"
import { formatDate } from "@/lib/utils"
import { Bot, Save, RotateCcw, Activity, Zap, Trash2, Plus } from "lucide-react"
import { motion } from "framer-motion"

interface AIAgent {
  id: number
  nome_agente: string | null
  prompt_atual: string | null
  prompt_backup: string | null
  data_atualizacao: string | null
  fluxo_agente: string | null
}

export default function CentralIA() {
  const [agents, setAgents] = useState<AIAgent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    nome_agente: "",
    prompt_atual: "",
    fluxo_agente: "",
  })

  useEffect(() => {
    loadAgents()
  }, [])

  async function loadAgents() {
    try {
      const { data, error } = await supabase
        .from("gerenciamento_ai")
        .select("*")
        .order("id", { ascending: true })

      if (error) throw error

      setAgents(data || [])
      
      // Selecionar primeiro agente automaticamente
      if (data && data.length > 0 && !selectedAgent) {
        handleSelectAgent(data[0])
      }
    } catch (error) {
      console.error("Erro ao carregar agentes:", error)
    } finally {
      setLoading(false)
    }
  }

  function handleSelectAgent(agent: AIAgent) {
    setSelectedAgent(agent)
    setFormData({
      nome_agente: agent.nome_agente || "",
      prompt_atual: agent.prompt_atual || "",
      fluxo_agente: agent.fluxo_agente || "",
    })
    setIsEditing(false)
  }

  async function handleSave() {
    if (!selectedAgent) return

    setSaving(true)
    try {
      // IMPORTANTE: Backup do prompt atual antes de substituir
      const updateData = {
        nome_agente: formData.nome_agente,
        prompt_atual: formData.prompt_atual,
        prompt_backup: selectedAgent.prompt_atual, // Salva o prompt atual como backup
        fluxo_agente: formData.fluxo_agente,
        data_atualizacao: new Date().toISOString(),
      }

      const { error } = await (supabase as any)
        .from("gerenciamento_ai")
        .update(updateData)
        .eq("id", selectedAgent.id)

      if (error) throw error

      await loadAgents()
      setIsEditing(false)
      alert("✅ Agente atualizado com sucesso! O prompt anterior foi salvo como backup.")
    } catch (error) {
      console.error("Erro ao salvar:", error)
      alert("❌ Erro ao salvar agente")
    } finally {
      setSaving(false)
    }
  }

  async function handleCreateAgent() {
    try {
      const insertData = {
        nome_agente: "Novo Agente",
        prompt_atual: "Digite o prompt do agente aqui...",
        prompt_backup: null,
        fluxo_agente: "",
        data_atualizacao: new Date().toISOString(),
      }

      const { error } = await (supabase as any)
        .from("gerenciamento_ai")
        .insert([insertData])

      if (error) throw error

      await loadAgents()
      alert("✅ Novo agente criado!")
    } catch (error) {
      console.error("Erro ao criar agente:", error)
      alert("❌ Erro ao criar agente")
    }
  }

  async function handleRestore() {
    if (!selectedAgent?.prompt_backup) {
      alert("❌ Não há backup disponível para este agente")
      return
    }

    if (confirm("⚠️ Deseja restaurar o prompt do backup? Isso substituirá o prompt atual.")) {
      setFormData({
        ...formData,
        prompt_atual: selectedAgent.prompt_backup,
      })
      setIsEditing(true)
    }
  }

  async function handleDeleteAgent() {
    if (!selectedAgent) return

    if (!confirm(`⚠️ Tem certeza que deseja excluir o agente "${selectedAgent.nome_agente}"? Esta ação não pode ser desfeita.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from("gerenciamento_ai")
        .delete()
        .eq("id", selectedAgent.id)

      if (error) throw error

      setSelectedAgent(null)
      await loadAgents()
      alert("✅ Agente excluído com sucesso!")
    } catch (error) {
      console.error("Erro ao excluir agente:", error)
      alert("❌ Erro ao excluir agente")
    }
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
              <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Central da IA</h2>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
              Gerencie e configure o agente de inteligência artificial
            </p>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
              {/* Lista de Agentes - Sidebar */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Todos os Agentes</h3>
                  <Button size="sm" onClick={handleCreateAgent}>
                    <Bot className="h-4 w-4 mr-2" />
                    Novo
                  </Button>
                </div>

                {agents.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <Bot className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground text-center">
                        Nenhum agente cadastrado
                      </p>
                      <Button size="sm" className="mt-4" onClick={handleCreateAgent}>
                        Criar Primeiro Agente
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {agents.map((agent, index) => (
                      <motion.div
                        key={agent.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Card
                          className={`cursor-pointer transition-all hover:shadow-md ${
                            selectedAgent?.id === agent.id
                              ? 'border-primary shadow-sm bg-primary/5'
                              : ''
                          }`}
                          onClick={() => handleSelectAgent(agent)}
                        >
                          <CardHeader className="p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <CardTitle className="text-base">
                                  {agent.nome_agente || "Sem nome"}
                                </CardTitle>
                                <CardDescription className="text-xs mt-1">
                                  {agent.data_atualizacao
                                    ? `Atualizado: ${formatDate(agent.data_atualizacao)}`
                                    : "Nunca atualizado"}
                                </CardDescription>
                              </div>
                              <div className="flex flex-col gap-1 items-end">
                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                {agent.prompt_backup && (
                                  <Badge variant="outline" className="text-xs">
                                    Backup
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Detalhes do Agente Selecionado */}
              <div className="space-y-6">{selectedAgent ? (
                <>
                  {/* Status do Agente */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Activity className="h-5 w-5" />
                          Status: {selectedAgent.nome_agente}
                        </CardTitle>
                        <CardDescription>
                          Informações sobre o estado atual do agente
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                              <Badge variant="success">Ativo</Badge>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Última Atualização</p>
                            <p className="font-medium mt-1">
                              {selectedAgent.data_atualizacao
                                ? formatDate(selectedAgent.data_atualizacao)
                                : "Nunca atualizado"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Backup</p>
                            <div className="flex items-center gap-2 mt-1">
                              {selectedAgent.prompt_backup ? (
                                <Badge variant="outline">Disponível</Badge>
                              ) : (
                                <Badge variant="secondary">Indisponível</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

              {/* Configuração do Agente */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Configuração do Agente</CardTitle>
                    <CardDescription>
                      Edite as informações e comportamento da IA
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome do Agente</Label>
                      <Input
                        id="nome"
                        placeholder="Ex: Assistente de Vendas"
                        value={formData.nome_agente}
                        onChange={(e) => {
                          setFormData({ ...formData, nome_agente: e.target.value })
                          setIsEditing(true)
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="prompt">Prompt Atual</Label>
                        {selectedAgent?.prompt_backup && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRestore}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Restaurar Backup
                          </Button>
                        )}
                      </div>
                      <Textarea
                        id="prompt"
                        placeholder="Insira o prompt que define o comportamento da IA..."
                        className="min-h-[200px] font-mono text-sm"
                        value={formData.prompt_atual}
                        onChange={(e) => {
                          setFormData({ ...formData, prompt_atual: e.target.value })
                          setIsEditing(true)
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        💡 Ao salvar, o prompt atual será movido para o backup automaticamente
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fluxo">Fluxo do Agente</Label>
                      <Textarea
                        id="fluxo"
                        placeholder="Descreva o fluxo de trabalho do agente..."
                        className="min-h-[150px]"
                        value={formData.fluxo_agente}
                        onChange={(e) => {
                          setFormData({ ...formData, fluxo_agente: e.target.value })
                          setIsEditing(true)
                        }}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={handleSave}
                        disabled={saving || !isEditing}
                        className="flex-1"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? "Salvando..." : "Salvar Alterações"}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAgent}
                        disabled={saving}
                      >
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Backup do Prompt */}
              {selectedAgent?.prompt_backup && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Backup do Prompt</CardTitle>
                      <CardDescription>
                        Versão anterior do prompt (restaurável)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted p-4 rounded-lg">
                        <pre className="text-sm whitespace-pre-wrap font-mono">
                          {selectedAgent.prompt_backup}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
                </>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Bot className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      Selecione um agente à esquerda para ver os detalhes
                    </p>
                  </CardContent>
                </Card>
              )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
