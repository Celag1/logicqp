import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Verificar si Mailpit está disponible
    const mailpitUrl = 'http://localhost:54324'
    
    const response = await fetch(mailpitUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })
    
    if (!response.ok) {
      return NextResponse.json({ 
        error: 'Mailpit no está disponible',
        status: response.status 
      }, { status: 500 })
    }
    
    const data = await response.text()
    
    return NextResponse.json({ 
      success: true,
      message: 'Mailpit está disponible',
      url: mailpitUrl,
      status: response.status
    })
    
  } catch (error) {
    console.error('Error verificando Mailpit:', error)
    return NextResponse.json({ 
      error: 'Error conectando con Mailpit',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
