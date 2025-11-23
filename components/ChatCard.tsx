'use client'

import { useCallback, useRef, useState } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export function ChatCard({ fid }: { fid: number }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight)
      }, 0)
    }
  }, [])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_fid: fid,
          message: input,
          history: messages,
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      let assistantMessage = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = new TextDecoder().decode(value)
        const lines = text.split('\n').filter(line => line.trim())

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.slice(5).trim()
            if (data === '[DONE]') continue
            assistantMessage += data
          }
        }

        setMessages(prev => {
          const lastMsg = prev[prev.length - 1]
          if (lastMsg?.role === 'assistant') {
            return [...prev.slice(0, -1), { ...lastMsg, content: assistantMessage }]
          }
          return [...prev, { role: 'assistant', content: assistantMessage, timestamp: Date.now() }]
        })

        scrollToBottom()
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      }])
    } finally {
      setLoading(false)
    }

    scrollToBottom()
  }

  return (
    <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', marginTop: '1rem' }}>
      <h2>Chat with AI Pet</h2>
      <div
        ref={scrollRef}
        style={{
          height: '400px',
          overflowY: 'auto',
          marginBottom: '1rem',
          padding: '0.5rem',
          backgroundColor: '#f9fafb',
          borderRadius: '0.25rem',
        }}
      >
        {messages.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center' }}>Start a conversation...</p>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} style={{
              marginBottom: '0.75rem',
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
              <div style={{
                maxWidth: '80%',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.5rem',
                backgroundColor: msg.role === 'user' ? '#3b82f6' : '#e5e7eb',
                color: msg.role === 'user' ? 'white' : 'black',
              }}>
                {msg.content}
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSendMessage(e as any)
            }
          }}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: '0.5rem',
            borderRadius: '0.25rem',
            border: '1px solid #d1d5db',
            fontFamily: 'inherit',
            resize: 'none',
          }}
          rows={2}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: loading ? '#ccc' : '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  )
}
