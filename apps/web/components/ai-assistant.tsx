"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  X,
  Sparkles,
  Crown,
  Zap
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  className?: string;
}

export default function AIAssistant({ className = '' }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! Soy el Asistente IA de LogicQP - La Mejor Tienda Virtual del Mundo! 🏆 Puedo ayudarte con consultas farmacéuticas, información de productos, dosis, interacciones medicamentosas y mucho más. ¿En qué puedo asistirte hoy?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Función para enviar mensaje
  const sendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Simular respuesta del asistente IA con respuestas inteligentes
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      const responses = [
        `Excelente consulta sobre "${content}". Como asistente farmacéutico especializado de LogicQP, puedo ayudarte con información detallada sobre medicamentos, dosis recomendadas, interacciones medicamentosas, efectos secundarios y consejos de salud. ¿Hay algún aspecto específico que te gustaría que profundice?`,
        `He recibido tu pregunta: "${content}". En LogicQP contamos con la mejor selección de productos farmacéuticos de Qualipharm. Puedo orientarte sobre medicamentos, equipos médicos, insumos y productos de laboratorio. ¿Te interesa conocer más sobre algún producto en particular?`,
        `¡Muy buena pregunta! "${content}" es un tema importante en farmacología. Como asistente IA especializado, puedo brindarte información precisa sobre medicamentos, sus usos terapéuticos, contraindicaciones y recomendaciones de uso. ¿Necesitas información específica sobre algún medicamento?`,
        `Perfecto, "${content}" es una consulta muy relevante. En LogicQP - La Mejor Tienda Virtual del Mundo, tenemos productos farmacéuticos de la más alta calidad. Puedo ayudarte con información sobre medicamentos, dosis, interacciones y mucho más. ¿Qué más te gustaría saber?`
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: randomResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Disculpa, hubo un error al procesar tu consulta. Por favor, intenta nuevamente. Estoy aquí para ayudarte con cualquier consulta farmacéutica.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para manejar envío
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  // Función para manejar tecla Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  // Auto-scroll a los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus en input cuando se abre
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  return (
    <>
      {/* Botón flotante */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 z-50 transform hover:scale-110 ${className}`}
        size="icon"
      >
        <MessageCircle className="h-7 w-7" />
      </Button>

      {/* Modal del asistente */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-end z-50 p-4">
          <Card className="w-full max-w-lg h-[700px] flex flex-col bg-white shadow-2xl rounded-2xl overflow-hidden">
            {/* Header */}
            <CardHeader className="flex-shrink-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold flex items-center space-x-2">
                      <Crown className="h-5 w-5 text-yellow-300" />
                      <span>Asistente IA LogicQP</span>
                      <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
                    </CardTitle>
                    <p className="text-sm text-white/90 font-medium">Farmacéutico Virtual Especializado</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 rounded-full w-10 h-10"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>

            {/* Mensajes */}
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e0 #f7fafc' }}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 shadow-lg ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {message.role === 'assistant' && (
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      )}
                      {message.role === 'user' && (
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                          {message.role === 'assistant' && (
                            <div className="flex items-center space-x-1">
                              <Zap className="h-3 w-3 text-yellow-500" />
                              <span className="text-xs text-yellow-600 font-medium">IA</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200 max-w-[85%]">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        <span className="text-sm text-gray-600">Pensando...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input y controles */}
            <div className="flex-shrink-0 p-6 bg-white border-t border-gray-200">
              <form onSubmit={handleSubmit} className="flex space-x-3">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu consulta farmacéutica..."
                  disabled={isLoading}
                  className="flex-1 rounded-full border-2 border-gray-200 focus:border-blue-500 focus:ring-0 px-4 py-3"
                />
                <Button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full w-12 h-12 shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </form>
              
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-500">
                  💡 <strong>Tip:</strong> Puedes preguntar sobre medicamentos, dosis, interacciones o cualquier consulta farmacéutica
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}