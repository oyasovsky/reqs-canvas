import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt, context } = await request.json()
    
    // Check if OpenAI API key is configured
    const openaiApiKey = process.env.OPENAI_API_KEY
    
    if (!openaiApiKey) {
      return NextResponse.json({ 
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.' 
      }, { status: 500 })
    }

    // Prepare the system message and user message
    const systemMessage = {
      role: 'system',
      content: `You are an expert AI assistant specializing in business requirements analysis for TPMs and Solution Architects. 
      
Your expertise includes:
- Business Requirements (BR) analysis and completion tracking
- Solution Requirements Template (SRT) interpretation
- Application dependency mapping
- Acceptance criteria drafting
- Non-functional requirements (NFRs) definition
- Risk, assumption, and constraint identification

Always provide:
1. Clear, actionable insights
2. Professional, expert-level analysis
3. Markdown formatting for readability
4. Specific next steps and recommendations
5. Context-aware responses based on the current SRT and BR selection`
    }

    const userMessage = {
      role: 'user',
      content: prompt
    }

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [systemMessage, userMessage],
        max_tokens: 1000,
        temperature: 0.7,
        stream: false
      })
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      console.error('OpenAI API error:', errorData)
      throw new Error(`OpenAI API error: ${openaiResponse.status}`)
    }

    const data = await openaiResponse.json()
    const response = data.choices[0]?.message?.content || 'No response from OpenAI'

    return NextResponse.json({ 
      response,
      usage: data.usage,
      model: data.model
    })

  } catch (error) {
    console.error('OpenAI route error:', error)
    return NextResponse.json({ 
      error: 'Failed to get AI response',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 