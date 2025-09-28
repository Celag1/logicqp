"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Send, 
  Bot, 
  User, 
  Sparkles,
  Lightbulb,
  BarChart3,
  Package,
  Users,
  Settings,
  MessageSquare,
  Zap,
  Star,
  Clock
} from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const quickActions = [
  {
    title: "Análisis de Ventas",
    description: "Obtén insights sobre el rendimiento de ventas",
    icon: BarChart3,
    prompt: "Analiza las ventas del último mes y proporciona recomendaciones"
  },
  {
    title: "Gestión de Inventario",
    description: "Optimiza el control de stock",
    icon: Package,
    prompt: "Revisa el inventario y sugiere productos para reabastecer"
  },
  {
    title: "Análisis de Clientes",
    description: "Conoce mejor a tus clientes",
    icon: Users,
    prompt: "Analiza el comportamiento de los clientes y sus preferencias"
  },
  {
    title: "Configuración del Sistema",
    description: "Optimiza la configuración",
    icon: Settings,
    prompt: "Revisa la configuración actual y sugiere mejoras"
  }
];

const sampleMessages: Message[] = [
  {
    id: "1",
    type: 'assistant',
    content: "¡Hola! Soy tu asistente de IA de LogicQP. ¿En qué puedo ayudarte hoy? Puedo ayudarte con análisis de datos, gestión de inventario, reportes y mucho más.",
    timestamp: new Date(),
    suggestions: [
      "Analiza las ventas de esta semana",
      "Revisa el inventario bajo",
      "Genera un reporte de clientes",
      "Optimiza la configuración"
    ]
  }
];

export default function AsistenteIAPage() {
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Simular respuesta del asistente
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `He procesado tu consulta: "${inputMessage}". Basándome en los datos de tu sistema, puedo ayudarte con análisis detallados, recomendaciones de optimización y insights específicos para tu negocio. ¿Te gustaría que profundice en algún aspecto particular?`,
        timestamp: new Date(),
        suggestions: [
          "Muestra más detalles",
          "Genera un reporte",
          "Analiza tendencias",
          "Sugiere mejoras"
        ]
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 2000);
  };

  const handleQuickAction = (prompt: string) => {
    setInputMessage(prompt);
  };

  const handleSuggestion = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Asistente de IA</h1>
              <p className="text-gray-600">Tu compañero inteligente para la gestión empresarial</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Conversación</span>
                </CardTitle>
                <CardDescription>
                  Chatea con tu asistente de IA para obtener ayuda inteligente
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.type === 'assistant' && (
                            <Bot className="h-5 w-5 mt-0.5 text-purple-600" />
                          )}
                          {message.type === 'user' && (
                            <User className="h-5 w-5 mt-0.5 text-white" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-2">
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        
                        {message.suggestions && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs font-medium opacity-70">Sugerencias:</p>
                            <div className="flex flex-wrap gap-2">
                              {message.suggestions.map((suggestion, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSuggestion(suggestion)}
                                  className="text-xs"
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <Bot className="h-5 w-5 text-purple-600" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="Escribe tu mensaje aquí..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    className="flex-1 min-h-[60px]"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Acciones Rápidas</span>
                </CardTitle>
                <CardDescription>
                  Comandos predefinidos para tareas comunes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start h-auto p-3"
                      onClick={() => handleQuickAction(action.prompt)}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className="h-5 w-5 mt-0.5 text-blue-600" />
                        <div className="text-left">
                          <p className="font-medium text-sm">{action.title}</p>
                          <p className="text-xs text-gray-500">{action.description}</p>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>Características</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Análisis inteligente</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Recomendaciones</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Reportes automáticos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Tiempo real</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
