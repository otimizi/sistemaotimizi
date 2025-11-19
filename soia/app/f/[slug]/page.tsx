"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { motion } from "framer-motion"
import { CheckCircle, Loader2 } from "lucide-react"

interface LandingPage {
  id: number
  titulo: string
  descricao: string | null
  campos_habilitados: string[]
  mensagem_whatsapp: string
  cor_primaria: string | null
  imagem_url: string | null
  webhook_url: string | null
}

export default function FormularioPublico() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [landingPage, setLandingPage] = useState<LandingPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>({})

  useEffect(() => {
    loadLandingPage()
    incrementarAcesso()
  }, [slug])

  async function loadLandingPage() {
    try {
      const { data, error } = await (supabase as any)
        .from("landing_pages")
        .select("*")
        .eq("slug", slug)
        .eq("ativo", true)
        .single()

      if (error) throw error

      setLandingPage(data)
      
      // Inicializar formData com campos vazios
      const initialData: Record<string, string> = {}
      data.campos_habilitados.forEach((campo: string) => {
        initialData[campo] = ""
      })
      setFormData(initialData)
    } catch (error) {
      console.error("Erro ao carregar landing page:", error)
    } finally {
      setLoading(false)
    }
  }

  async function enviarWebhook(dados: Record<string, string>, clienteId: number | null) {
    if (!landingPage?.webhook_url) return

    try {
      await fetch(landingPage.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo: 'landing_page_conversao',
          enviado_em: new Date().toISOString(),
          origem: window.location.origin,
          landing_page: {
            id: landingPage.id,
            slug,
            titulo: landingPage.titulo,
          },
          cliente_id: clienteId,
          dados,
        }),
      })
    } catch (error) {
      console.error('Erro ao disparar webhook:', error)
    }
  }

  async function incrementarAcesso() {
    try {
      // Incrementar contador de acessos
      const { data } = await (supabase as any)
        .from("landing_pages")
        .select("total_acessos")
        .eq("slug", slug)
        .single()

      if (data) {
        await (supabase as any)
          .from("landing_pages")
          .update({ total_acessos: data.total_acessos + 1 })
          .eq("slug", slug)
      }
    } catch (error) {
      console.error("Erro ao incrementar acesso:", error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!landingPage) return

    setSubmitting(true)

    try {
      // 1. Salvar ou atualizar cliente
      let clienteId: number | null = null

      if (formData.telefone) {
        // Verificar se cliente já existe pelo telefone
        const { data: clienteExistente } = await (supabase as any)
          .from("clientes")
          .select("id")
          .eq("telefone", formData.telefone)
          .single()

        if (clienteExistente) {
          // Atualizar cliente existente
          const { error: updateError } = await (supabase as any)
            .from("clientes")
            .update({
              nome: formData.nome || null,
              email: formData.email || null,
              cpf_cnpj: formData.cpf_cnpj || null,
              cidade: formData.cidade || null,
              estado: formData.estado || null,
              cep: formData.cep || null,
              rua: formData.rua || null,
              numero_ende: formData.numero_ende || null,
            })
            .eq("id", clienteExistente.id)

          if (updateError) throw updateError
          clienteId = clienteExistente.id
        } else {
          // Criar novo cliente
          const { data: novoCliente, error: insertError } = await (supabase as any)
            .from("clientes")
            .insert([{
              nome: formData.nome || null,
              email: formData.email || null,
              telefone: formData.telefone || null,
              cpf_cnpj: formData.cpf_cnpj || null,
              cidade: formData.cidade || null,
              estado: formData.estado || null,
              cep: formData.cep || null,
              rua: formData.rua || null,
              numero_ende: formData.numero_ende || null,
            }])
            .select("id")
            .single()

          if (insertError) throw insertError
          clienteId = novoCliente.id
        }
      }

      // 2. Registrar conversão
      const { error: conversaoError } = await (supabase as any)
        .from("landing_page_conversoes")
        .insert([{
          landing_page_id: landingPage.id,
          cliente_id: clienteId,
          dados_capturados: formData,
        }])

      if (conversaoError) throw conversaoError

      // 3. Incrementar contador de conversões
      const { data: currentPage } = await (supabase as any)
        .from("landing_pages")
        .select("total_conversoes")
        .eq("id", landingPage.id)
        .single()

      if (currentPage) {
        await (supabase as any)
          .from("landing_pages")
          .update({ total_conversoes: currentPage.total_conversoes + 1 })
          .eq("id", landingPage.id)
      }

      // 4. Enviar WhatsApp via API
      if (formData.telefone) {
        await enviarWhatsApp(formData.telefone, formData)
      }

      // 5. Disparar webhook em segundo plano
      if (landingPage.webhook_url) {
        enviarWebhook(formData, clienteId)
      }

      setSuccess(true)
    } catch (error) {
      console.error("Erro ao enviar formulário:", error)
      alert("Erro ao enviar formulário. Tente novamente.")
    } finally {
      setSubmitting(false)
    }
  }

  function formatarTelefoneBrasileiro(telefone: string): string {
    // Remove tudo que não é número
    let numeros = telefone.replace(/\D/g, '')
    
    // Se começar com 0, remove
    if (numeros.startsWith('0')) {
      numeros = numeros.substring(1)
    }
    
    // Se não tem DDI (55), adiciona
    if (!numeros.startsWith('55')) {
      numeros = '55' + numeros
    }
    
    // Garantir que o número do celular tenha 9 dígitos
    // Formato esperado: 55 + DDD (2) + número (9) = 13 dígitos total
    if (numeros.length === 12) {
      // Número com 8 dígitos (falta o 9), adiciona o 9 após o DDD
      numeros = numeros.substring(0, 4) + '9' + numeros.substring(4)
    }
    
    return numeros
  }

  async function salvarNoHistoricoChat(telefone: string, mensagem: string) {
    try {
      const numeroFormatado = formatarTelefoneBrasileiro(telefone)
      
      await (supabase as any)
        .from("n8n_chat_histories")
        .insert([{
          session_id: numeroFormatado,
          message: {
            type: "ai",
            content: mensagem,
            tool_calls: [],
            additional_kwargs: {},
            response_metadata: {},
            invalid_tool_calls: []
          }
        }])
    } catch (error) {
      console.error("Erro ao salvar no histórico:", error)
    }
  }

  async function enviarWhatsApp(telefone: string, dados: Record<string, string>) {
    try {
      // Substituir variáveis na mensagem
      let mensagem = landingPage?.mensagem_whatsapp || ""
      
      Object.keys(dados).forEach(key => {
        const regex = new RegExp(`\\{${key}\\}`, 'g')
        mensagem = mensagem.replace(regex, dados[key] || "")
      })

      // Formatar telefone brasileiro (DDI+DDD+9dígitos)
      const numeroFormatado = formatarTelefoneBrasileiro(telefone)

      // Enviar para API da Otimizi
      const response = await fetch('https://otimizi.uazapi.com/send/text', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'token': 'cd8f9e7e-972a-4446-8d06-6e63c5caeb78'
        },
        body: JSON.stringify({
          number: numeroFormatado,
          text: mensagem
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao enviar WhatsApp')
      }

      // Salvar mensagem no histórico de chat
      await salvarNoHistoricoChat(telefone, mensagem)

      // Registrar sucesso do envio
      await (supabase as any)
        .from("landing_page_conversoes")
        .update({ whatsapp_enviado: true })
        .eq("landing_page_id", landingPage?.id)
        .order("created_at", { ascending: false })
        .limit(1)

    } catch (error) {
      console.error("Erro ao enviar WhatsApp:", error)
      
      // Registrar erro
      await (supabase as any)
        .from("landing_page_conversoes")
        .update({ 
          whatsapp_enviado: false,
          whatsapp_erro: error instanceof Error ? error.message : 'Erro desconhecido'
        })
        .eq("landing_page_id", landingPage?.id)
        .order("created_at", { ascending: false })
        .limit(1)
    }
  }

  const getCampoLabel = (campo: string) => {
    const labels: Record<string, string> = {
      nome: "Nome",
      email: "Email",
      telefone: "Telefone",
      cpf_cnpj: "CPF/CNPJ",
      cidade: "Cidade",
      estado: "Estado",
      cep: "CEP",
      rua: "Rua",
      numero_ende: "Número",
    }
    return labels[campo] || campo
  }

  const getCampoType = (campo: string) => {
    if (campo === "email") return "email"
    if (campo === "telefone") return "tel"
    return "text"
  }

  const formatarTelefoneVisual = (valor: string) => {
    // Remove tudo que não é número
    const numeros = valor.replace(/\D/g, '')
    
    // Aplica máscara (XX) XXXXX-XXXX
    if (numeros.length <= 2) {
      return numeros
    } else if (numeros.length <= 7) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`
    } else if (numeros.length <= 11) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`
    } else {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`
    }
  }

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarTelefoneVisual(e.target.value)
    setFormData({ ...formData, telefone: valorFormatado })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!landingPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Página não encontrada ou inativa</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold">Cadastro Realizado!</h2>
              <p className="text-muted-foreground">
                Obrigado pelo seu interesse. Você receberá uma mensagem em breve!
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: `linear-gradient(135deg, ${landingPage.cor_primaria}20 0%, ${landingPage.cor_primaria}10 100%)`
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{landingPage.titulo}</CardTitle>
            {landingPage.descricao && (
              <CardDescription>{landingPage.descricao}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {landingPage.campos_habilitados.map((campo) => (
                <div key={campo}>
                  <Label htmlFor={campo}>
                    {getCampoLabel(campo)} {campo === "nome" || campo === "telefone" ? "*" : ""}
                  </Label>
                  <Input
                    id={campo}
                    type={getCampoType(campo)}
                    value={formData[campo] || ""}
                    onChange={campo === "telefone" ? handleTelefoneChange : (e) => setFormData({ ...formData, [campo]: e.target.value })}
                    required={campo === "nome" || campo === "telefone"}
                    placeholder={campo === "telefone" ? "(00) 00000-0000" : `Digite seu ${getCampoLabel(campo).toLowerCase()}`}
                    maxLength={campo === "telefone" ? 15 : undefined}
                  />
                </div>
              ))}

              <Button
                type="submit"
                className="w-full"
                disabled={submitting}
                style={{ backgroundColor: landingPage.cor_primaria || undefined }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar Cadastro"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
