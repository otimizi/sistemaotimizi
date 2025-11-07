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
import { Link2, Plus, Copy, ExternalLink, TrendingUp, Users, Eye, Check, Settings } from "lucide-react"
import { motion } from "framer-motion"
import { formatDate } from "@/lib/utils"

interface LandingPage {
  id: number
  slug: string
  titulo: string
  descricao: string | null
  campos_habilitados: string[]
  mensagem_whatsapp: string
  cor_primaria: string | null
  imagem_url: string | null
  ativo: boolean
  total_acessos: number
  total_conversoes: number
  created_at: string
}

const CAMPOS_DISPONIVEIS = [
  { value: "nome", label: "Nome" },
  { value: "email", label: "Email" },
  { value: "telefone", label: "Telefone" },
  { value: "cpf_cnpj", label: "CPF/CNPJ" },
  { value: "cidade", label: "Cidade" },
  { value: "estado", label: "Estado" },
  { value: "cep", label: "CEP" },
  { value: "rua", label: "Rua" },
  { value: "numero_ende", label: "Número" },
]

export default function CentralLinks() {
  const [landingPages, setLandingPages] = useState<LandingPage[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPage, setEditingPage] = useState<LandingPage | null>(null)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    slug: "",
    campos_habilitados: ["nome", "telefone", "email"],
    mensagem_whatsapp: "Olá {nome}! Recebemos seu cadastro e entraremos em contato em breve. 🚀",
    cor_primaria: "#3B82F6",
  })

  useEffect(() => {
    loadLandingPages()
  }, [])

  async function loadLandingPages() {
    try {
      const { data, error } = await supabase
        .from("landing_pages")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setLandingPages(data || [])
    } catch (error) {
      console.error("Erro ao carregar landing pages:", error)
    } finally {
      setLoading(false)
    }
  }

  function gerarSlugLimpo(titulo: string): string {
    // Palavras que devem ser removidas (artigos, preposições, etc)
    const stopWords = ['o', 'a', 'os', 'as', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas', 'para', 'por', 'com', 'sem']
    
    // Converter para lowercase e remover acentos
    let slug = titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    
    // Separar palavras
    let palavras = slug.split(/\s+/)
    
    // Remover stop words (palavras muito curtas que não agregam)
    palavras = palavras.filter(palavra => 
      palavra.length > 2 && !stopWords.includes(palavra)
    )
    
    // Juntar palavras e limpar caracteres especiais
    slug = palavras
      .join('-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    
    // Limitar tamanho (máximo 30 caracteres)
    if (slug.length > 30) {
      slug = slug.substring(0, 30).replace(/-[^-]*$/, '')
    }
    
    // Adicionar identificador único curto (6 caracteres)
    const randomId = Math.random().toString(36).substring(2, 8)
    
    return `${slug}-${randomId}`
  }

  async function verificarSlugUnico(slug: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("landing_pages")
      .select("id")
      .eq("slug", slug)
      .single()

    // Se não encontrar, o slug está disponível
    return !data
  }

  async function handleSave() {
    try {
      // Gerar slug se não foi fornecido
      let slug = formData.slug
      
      if (!slug) {
        slug = gerarSlugLimpo(formData.titulo)
      } else {
        // Se o usuário definiu um slug customizado, verificar se é único
        const isUnico = await verificarSlugUnico(slug)
        if (!isUnico) {
          alert("❌ Esta URL já está em uso. Escolha outra ou deixe em branco para gerar automaticamente.")
          return
        }
      }
      
      // Se estiver editando, manter o slug original
      if (editingPage) {
        slug = editingPage.slug
      }

      const dataToSave = {
        ...formData,
        slug: editingPage ? editingPage.slug : slug,
        campos_habilitados: formData.campos_habilitados,
      }

      if (editingPage) {
        const { error } = await (supabase as any)
          .from("landing_pages")
          .update(dataToSave)
          .eq("id", editingPage.id)

        if (error) throw error
      } else {
        const { error } = await (supabase as any)
          .from("landing_pages")
          .insert([dataToSave])

        if (error) throw error
      }

      await loadLandingPages()
      handleCloseModal()
      alert("✅ Landing page salva com sucesso!")
    } catch (error) {
      console.error("Erro ao salvar:", error)
      alert("❌ Erro ao salvar landing page")
    }
  }

  async function handleToggleStatus(page: LandingPage) {
    try {
      const { error } = await (supabase as any)
        .from("landing_pages")
        .update({ ativo: !page.ativo })
        .eq("id", page.id)

      if (error) throw error
      await loadLandingPages()
    } catch (error) {
      console.error("Erro ao alterar status:", error)
    }
  }

  async function handleDelete(page: LandingPage) {
    if (!confirm(`⚠️ Tem certeza que deseja excluir "${page.titulo}"?`)) return

    try {
      const { error } = await supabase
        .from("landing_pages")
        .delete()
        .eq("id", page.id)

      if (error) throw error
      await loadLandingPages()
      alert("✅ Landing page excluída!")
    } catch (error) {
      console.error("Erro ao excluir:", error)
      alert("❌ Erro ao excluir")
    }
  }

  function handleOpenModal(page?: LandingPage) {
    if (page) {
      setEditingPage(page)
      setFormData({
        titulo: page.titulo,
        descricao: page.descricao || "",
        slug: page.slug,
        campos_habilitados: page.campos_habilitados,
        mensagem_whatsapp: page.mensagem_whatsapp,
        cor_primaria: page.cor_primaria || "#3B82F6",
      })
    } else {
      setEditingPage(null)
      setFormData({
        titulo: "",
        descricao: "",
        slug: "",
        campos_habilitados: ["nome", "telefone", "email"],
        mensagem_whatsapp: "Olá {nome}! Recebemos seu cadastro e entraremos em contato em breve. 🚀",
        cor_primaria: "#3B82F6",
      })
    }
    setShowModal(true)
  }

  function handleCloseModal() {
    setShowModal(false)
    setEditingPage(null)
  }

  function toggleCampo(campo: string) {
    if (formData.campos_habilitados.includes(campo)) {
      setFormData({
        ...formData,
        campos_habilitados: formData.campos_habilitados.filter(c => c !== campo)
      })
    } else {
      setFormData({
        ...formData,
        campos_habilitados: [...formData.campos_habilitados, campo]
      })
    }
  }

  function copyLink(slug: string) {
    const url = `${window.location.origin}/f/${slug}`
    navigator.clipboard.writeText(url)
    setCopiedSlug(slug)
    setTimeout(() => setCopiedSlug(null), 2000)
  }

  const stats = {
    total: landingPages.length,
    ativas: landingPages.filter(p => p.ativo).length,
    totalAcessos: landingPages.reduce((acc, p) => acc + p.total_acessos, 0),
    totalConversoes: landingPages.reduce((acc, p) => acc + p.total_conversoes, 0),
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Link2 className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold tracking-tight">Central de Links</h2>
              </div>
              <Button onClick={() => handleOpenModal()}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Landing Page
              </Button>
            </div>
            <p className="text-muted-foreground mb-8">
              Crie e gerencie páginas de captura de leads
            </p>
          </motion.div>

          {/* Estatísticas */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Páginas</CardTitle>
                <Link2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Páginas Ativas</CardTitle>
                <Check className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.ativas}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Acessos</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAcessos}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversões</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalConversoes}</div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Landing Pages */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : landingPages.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Link2 className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Nenhuma landing page criada ainda</p>
                <Button onClick={() => handleOpenModal()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Página
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {landingPages.map((page, index) => (
                <motion.div
                  key={page.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle>{page.titulo}</CardTitle>
                            <Badge variant={page.ativo ? "success" : "secondary"}>
                              {page.ativo ? "Ativa" : "Inativa"}
                            </Badge>
                          </div>
                          <CardDescription>{page.descricao || "Sem descrição"}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* URL */}
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <code className="flex-1 text-sm">{window.location.origin}/f/{page.slug}</code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyLink(page.slug)}
                        >
                          {copiedSlug === page.slug ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/f/${page.slug}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Métricas */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{page.total_acessos}</p>
                          <p className="text-xs text-muted-foreground">Acessos</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">{page.total_conversoes}</p>
                          <p className="text-xs text-muted-foreground">Conversões</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">
                            {page.total_acessos > 0
                              ? ((page.total_conversoes / page.total_acessos) * 100).toFixed(1)
                              : 0}%
                          </p>
                          <p className="text-xs text-muted-foreground">Taxa</p>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenModal(page)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant={page.ativo ? "secondary" : "default"}
                          onClick={() => handleToggleStatus(page)}
                        >
                          {page.ativo ? "Desativar" : "Ativar"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(page)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal de Criação/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">
                  {editingPage ? "Editar Landing Page" : "Nova Landing Page"}
                </h3>
                <Button variant="ghost" onClick={handleCloseModal}>✕</Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Ex: Cadastro de Interesse"
                  />
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Preencha o formulário para receber mais informações"
                  />
                </div>

                {!editingPage && (
                  <div>
                    <Label htmlFor="slug">URL Personalizada (Opcional)</Label>
                    <div className="flex gap-2 items-center">
                      <span className="text-sm text-muted-foreground">/f/</span>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => {
                          // Permitir apenas letras, números e hífens
                          const valor = e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, '')
                          setFormData({ ...formData, slug: valor })
                        }}
                        placeholder="ex: cadastro-vip"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Deixe vazio para gerar automaticamente um slug limpo
                    </p>
                  </div>
                )}

                <div>
                  <Label>Campos a Coletar *</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {CAMPOS_DISPONIVEIS.map((campo) => (
                      <div
                        key={campo.value}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          formData.campos_habilitados.includes(campo.value)
                            ? 'border-primary bg-primary/10'
                            : 'border-muted hover:border-primary/50'
                        }`}
                        onClick={() => toggleCampo(campo.value)}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
                            formData.campos_habilitados.includes(campo.value)
                              ? 'border-primary bg-primary'
                              : 'border-muted-foreground'
                          }`}>
                            {formData.campos_habilitados.includes(campo.value) && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <span className="text-sm">{campo.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="mensagem">Mensagem WhatsApp *</Label>
                  <Textarea
                    id="mensagem"
                    value={formData.mensagem_whatsapp}
                    onChange={(e) => setFormData({ ...formData, mensagem_whatsapp: e.target.value })}
                    placeholder="Use {nome}, {email}, {telefone} para personalizar"
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    💡 Use variáveis como {"{nome}"}, {"{email}"}, {"{telefone}"} para personalizar a mensagem
                  </p>
                </div>

                <div>
                  <Label htmlFor="cor">Cor Primária</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="cor"
                      type="color"
                      value={formData.cor_primaria}
                      onChange={(e) => setFormData({ ...formData, cor_primaria: e.target.value })}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={formData.cor_primaria}
                      onChange={(e) => setFormData({ ...formData, cor_primaria: e.target.value })}
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSave} className="flex-1">
                  {editingPage ? "Salvar Alterações" : "Criar Landing Page"}
                </Button>
                <Button variant="outline" onClick={handleCloseModal}>
                  Cancelar
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
