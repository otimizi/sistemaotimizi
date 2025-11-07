"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { formatDateShort } from "@/lib/utils"
import { Package, Search } from "lucide-react"
import { motion } from "framer-motion"

interface Product {
  id: number
  created_at: string
  item_id: string | null
  item_titulo: string | null
  descricao_produto: string | null
  informacoes_adicionais: string | null
}

export default function Produtos() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    try {
      const { data, error } = await supabase
        .from("mercadolivre_produtos")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product =>
    product.item_titulo?.toLowerCase().includes(search.toLowerCase()) ||
    product.item_id?.toLowerCase().includes(search.toLowerCase())
  )

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
            <div className="flex items-center gap-3 mb-2">
              <Package className="h-8 w-8 text-primary" />
              <h2 className="text-3xl font-bold tracking-tight">Produtos Mercado Livre</h2>
            </div>
            <p className="text-muted-foreground mb-8">
              Catálogo de produtos cadastrados no sistema
            </p>
          </motion.div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou ID do produto..."
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
          ) : filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  {search ? "Nenhum produto encontrado" : "Nenhum produto cadastrado ainda"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">
                            {product.item_titulo || "Produto sem título"}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            ID: {product.item_id || "N/A"}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">ML</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {product.descricao_produto && (
                        <div>
                          <p className="text-sm font-medium mb-1 text-muted-foreground">
                            Descrição
                          </p>
                          <p className="text-sm line-clamp-3">
                            {product.descricao_produto}
                          </p>
                        </div>
                      )}
                      {product.informacoes_adicionais && (
                        <div>
                          <p className="text-sm font-medium mb-1 text-muted-foreground">
                            Informações Adicionais
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {product.informacoes_adicionais}
                          </p>
                        </div>
                      )}
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          Cadastrado em {formatDateShort(product.created_at)}
                        </p>
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
