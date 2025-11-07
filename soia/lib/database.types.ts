export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      clientes: {
        Row: {
          id: number
          created_at: string
          nome: string | null
          cpf_cnpj: string | null
          cep: string | null
          rua: string | null
          numero_ende: string | null
          cidade: string | null
          estado: string | null
          telefone: string | null
          email: string | null
          setor_atual: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          nome?: string | null
          cpf_cnpj?: string | null
          cep?: string | null
          rua?: string | null
          numero_ende?: string | null
          cidade?: string | null
          estado?: string | null
          telefone?: string | null
          email?: string | null
          setor_atual?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          nome?: string | null
          cpf_cnpj?: string | null
          cep?: string | null
          rua?: string | null
          numero_ende?: string | null
          cidade?: string | null
          estado?: string | null
          telefone?: string | null
          email?: string | null
          setor_atual?: string | null
        }
      }
      documents: {
        Row: {
          id: number
          content: string | null
          metadata: Json | null
          embedding: unknown | null
        }
        Insert: {
          id?: number
          content?: string | null
          metadata?: Json | null
          embedding?: unknown | null
        }
        Update: {
          id?: number
          content?: string | null
          metadata?: Json | null
          embedding?: unknown | null
        }
      }
      mercadolivre_produtos: {
        Row: {
          id: number
          created_at: string
          item_id: string | null
          item_titulo: string | null
          descricao_produto: string | null
          informacoes_adicionais: string | null
          link_produto: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          item_id?: string | null
          item_titulo?: string | null
          descricao_produto?: string | null
          informacoes_adicionais?: string | null
          link_produto?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          item_id?: string | null
          item_titulo?: string | null
          descricao_produto?: string | null
          informacoes_adicionais?: string | null
          link_produto?: string | null
        }
      }
      mercadolivre_registro_comentarios: {
        Row: {
          id: number
          created_at: string
          item_id: string | null
          pergunta_cliente: string | null
          resposta_ia: string | null
          item_titulo: string | null
          item_link: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          item_id?: string | null
          pergunta_cliente?: string | null
          resposta_ia?: string | null
          item_titulo?: string | null
          item_link?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          item_id?: string | null
          pergunta_cliente?: string | null
          resposta_ia?: string | null
          item_titulo?: string | null
          item_link?: string | null
        }
      }
      mercadolivre_registro_msgposvenda: {
        Row: {
          id: number
          created_at: string
          order_id: string | null
          pack_id: string | null
          status_envio: boolean | null
        }
        Insert: {
          id?: number
          created_at?: string
          order_id?: string | null
          pack_id?: string | null
          status_envio?: boolean | null
        }
        Update: {
          id?: number
          created_at?: string
          order_id?: string | null
          pack_id?: string | null
          status_envio?: boolean | null
        }
      }
      n8n_chat_histories: {
        Row: {
          id: number
          session_id: string
          message: Json
          data_registro: string
        }
        Insert: {
          id?: number
          session_id: string
          message: Json
          data_registro?: string
        }
        Update: {
          id?: number
          session_id?: string
          message?: Json
          data_registro?: string
        }
      }
      registro_notificacao_mercadolivre: {
        Row: {
          id: number
          created_at: string
          id_mensagem: string | null
          id_cliente: string | null
          id_order: string | null
          status_envio: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          id_mensagem?: string | null
          id_cliente?: string | null
          id_order?: string | null
          status_envio?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          id_mensagem?: string | null
          id_cliente?: string | null
          id_order?: string | null
          status_envio?: string | null
        }
      }
      registros_notificacao: {
        Row: {
          id: number
          created_at: string
          cliente_id: number | null
          assunto: string | null
          conteudo: string | null
          status: string | null
          tipo: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          cliente_id?: number | null
          assunto?: string | null
          conteudo?: string | null
          status?: string | null
          tipo?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          cliente_id?: number | null
          assunto?: string | null
          conteudo?: string | null
          status?: string | null
          tipo?: string | null
        }
      }
      roleta_atendimento: {
        Row: {
          id: number
          created_at: string
          ultimo_indice: number | null
          prox_indice: number | null
        }
        Insert: {
          id?: number
          created_at?: string
          ultimo_indice?: number | null
          prox_indice?: number | null
        }
        Update: {
          id?: number
          created_at?: string
          ultimo_indice?: number | null
          prox_indice?: number | null
        }
      }
      vendedores: {
        Row: {
          id: number
          created_at: string
          nome: string | null
          telefone: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          nome?: string | null
          telefone?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          nome?: string | null
          telefone?: string | null
        }
      }
      gerenciamento_ai: {
        Row: {
          id: number
          created_at: string
          nome_agente: string | null
          prompt_atual: string | null
          prompt_backup: string | null
          data_atualizacao: string | null
          fluxo_agente: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          nome_agente?: string | null
          prompt_atual?: string | null
          prompt_backup?: string | null
          data_atualizacao?: string | null
          fluxo_agente?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          nome_agente?: string | null
          prompt_atual?: string | null
          prompt_backup?: string | null
          data_atualizacao?: string | null
          fluxo_agente?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
