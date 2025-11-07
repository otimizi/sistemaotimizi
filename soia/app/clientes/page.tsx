"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { Users, Search, Mail, Phone, MapPin } from "lucide-react"
import { motion } from "framer-motion"

interface Cliente {
  id: number
  created_at: string
  nome: string | null
  cpf_cnpj: string | null
  email: string | null
  telefone: string | null
  cidade: string | null
  estado: string | null
  setor_atual: string | null
}

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    loadClientes()
  }, [])

  async function loadClientes() {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setClientes(data || [])
    } catch (error) {
      console.error("Erro ao carregar clientes:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome?.toLowerCase().includes(search.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(search.toLowerCase()) ||
    cliente.telefone?.includes(search)
  )

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
            </div>
            <p className="text-muted-foreground mb-8">
              Gerenciamento de clientes cadastrados no sistema
            </p>
          </motion.div>

          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou telefone..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Badge variant="secondary" className="px-4 py-2">
              Total: {filteredClientes.length}
            </Badge>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          ) : filteredClientes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  {search ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado ainda"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredClientes.map((cliente, index) => (
                <motion.div
                  key={cliente.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                >
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg line-clamp-1">
                        {cliente.nome || "Cliente sem nome"}
                      </CardTitle>
                      {cliente.setor_atual && (
                        <CardDescription>
                          <Badge variant="outline" className="mt-1">
                            {cliente.setor_atual}
                          </Badge>
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {cliente.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{cliente.email}</span>
                        </div>
                      )}
                      {cliente.telefone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{cliente.telefone}</span>
                        </div>
                      )}
                      {(cliente.cidade || cliente.estado) && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {[cliente.cidade, cliente.estado].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      )}
                      {cliente.cpf_cnpj && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground">
                            CPF/CNPJ: {cliente.cpf_cnpj}
                          </p>
                        </div>
                      )}
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
