"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Package,
  Bell,
  Settings,
  Bot,
  ShoppingCart,
  MessagesSquare,
  Link2,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Central da IA", href: "/central-ia", icon: Bot },
  { name: "Central de Links", href: "/central-links", icon: Link2 },
  { name: "Conversas", href: "/conversas", icon: MessagesSquare },
  { name: "Comentários Pré-Venda", href: "/comentarios", icon: MessageSquare },
  { name: "Mensagens Pós-Venda", href: "/pos-venda", icon: ShoppingCart },
  { name: "Notificações", href: "/notificacoes", icon: Bell },
  { name: "Produtos ML", href: "/produtos", icon: Package },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Configurações", href: "/configuracoes", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          SOIA
        </h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground text-center">
          Sistema Otimizi IA v1.0
        </p>
      </div>
    </div>
  )
}
