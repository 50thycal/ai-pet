import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

interface ChatRequest {
  user_fid: number
  message: string
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      )
    }

    const body: ChatRequest = await request.json()
    const { user_fid, message, history = [] } = body

    if (!user_fid || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: user_fid and message' },
        { status: 400 }
      )
    }

    const client = new OpenAI({ apiKey })

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: "You are a friendly and helpful AI companion. Be conversational, warm, and engaging.",
      },
      ...history.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user',
        content: message,
      },
    ]

    const stream = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 500,
      temperature: 0.8,
      stream: true,
    })

    const encoder = new TextEncoder()
    const customStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content
            if (text) {
              controller.enqueue(encoder.encode(`data: ${text}\n\n`))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new NextResponse(customStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
