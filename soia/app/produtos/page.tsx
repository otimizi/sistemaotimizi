"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { formatDateShort } from "@/lib/utils"
import { Package, Search, Pencil, ExternalLink, Save } from "lucide-react"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

interface Product {
  id: number
  created_at: string
  item_id: string | null
  item_titulo: string | null
  descricao_produto: string | null
  informacoes_adicionais: string | null
  link_produto: string | null
}

export default function Produtos() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

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

  function handleEditProduct(product: Product) {
    setEditingProduct(product)
    setIsDialogOpen(true)
  }

  function handleCloseDialog() {
    setIsDialogOpen(false)
    setEditingProduct(null)
  }

  async function handleSaveProduct() {
    if (!editingProduct) return

    setSaving(true)
    try {
      // Normalizar valores null para evitar erro de tipo
      const updateData = {
        item_titulo: editingProduct.item_titulo ?? '',
        descricao_produto: editingProduct.descricao_produto ?? '',
        informacoes_adicionais: editingProduct.informacoes_adicionais ?? '',
        link_produto: editingProduct.link_produto ?? '',
      }

      const { error } = await (supabase as any)
        .from("mercadolivre_produtos")
        .update(updateData)
        .eq("id", editingProduct.id)

      if (error) throw error

      // Atualizar lista local
      setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p))

      toast({
        title: "Sucesso!",
        description: "Produto atualizado com sucesso.",
      })

      handleCloseDialog()
    } catch (error) {
      console.error("Erro ao salvar produto:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar o produto. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  function updateEditingProduct(field: keyof Product, value: string) {
    if (!editingProduct) return
    setEditingProduct({ ...editingProduct, [field]: value })
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
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">ML</Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditProduct(product)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
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
                      {product.link_produto && (
                        <div>
                          <p className="text-sm font-medium mb-1 text-muted-foreground">
                            Link do Produto
                          </p>
                          <a
                            href={product.link_produto}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            Ver no Mercado Livre
                            <ExternalLink className="h-3 w-3" />
                          </a>
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

      {/* Dialog de Edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>
              Atualize as informações do produto do Mercado Livre
            </DialogDescription>
          </DialogHeader>

          {editingProduct && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="item_id">ID do Item</Label>
                <Input
                  id="item_id"
                  value={editingProduct.item_id || ""}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="item_titulo">Título do Produto</Label>
                <Input
                  id="item_titulo"
                  value={editingProduct.item_titulo || ""}
                  onChange={(e) => updateEditingProduct("item_titulo", e.target.value)}
                  placeholder="Digite o título do produto"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao_produto">Descrição</Label>
                <Textarea
                  id="descricao_produto"
                  value={editingProduct.descricao_produto || ""}
                  onChange={(e) => updateEditingProduct("descricao_produto", e.target.value)}
                  placeholder="Digite a descrição do produto"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="informacoes_adicionais">Informações Adicionais</Label>
                <Textarea
                  id="informacoes_adicionais"
                  value={editingProduct.informacoes_adicionais || ""}
                  onChange={(e) => updateEditingProduct("informacoes_adicionais", e.target.value)}
                  placeholder="Digite informações adicionais sobre o produto"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="link_produto">Link do Produto</Label>
                <Input
                  id="link_produto"
                  type="url"
                  value={editingProduct.link_produto || ""}
                  onChange={(e) => updateEditingProduct("link_produto", e.target.value)}
                  placeholder="https://produto.mercadolivre.com.br/..."
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDialog}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveProduct}
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="mr-2">Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
