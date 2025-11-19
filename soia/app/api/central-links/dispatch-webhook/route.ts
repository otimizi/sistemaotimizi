import { NextResponse } from "next/server"

interface DispatchBody {
  webhookUrl?: string
  payload?: unknown
}

function isValidWebhookUrl(url: string) {
  try {
    const parsed = new URL(url)
    return parsed.protocol === "https:" || parsed.protocol === "http:"
  } catch {
    return false
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DispatchBody
    const { webhookUrl, payload } = body

    if (!webhookUrl || !isValidWebhookUrl(webhookUrl)) {
      return NextResponse.json(
        { success: false, message: "URL de webhook inválida" },
        { status: 400 }
      )
    }

    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Payload ausente" },
        { status: 400 }
      )
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => undefined)
      throw new Error(text || "Falha ao enviar webhook")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao despachar webhook:", error)
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Erro desconhecido ao enviar webhook",
      },
      { status: 500 }
    )
  }
}
