"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Loader2, 
  Copy, 
  ThumbsUp, 
  ThumbsDown,
  RefreshCw,
  Settings,
  Zap,
  Brain,
  MessageSquare
} from "lucide-react";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const quickActions = [
  { label: "Ayuda con productos", prompt: "Necesito ayuda para encontrar productos específicos" },
  { label: "Consultar inventario", prompt: "¿Qué productos están disponibles en stock?" },
  { label: "Soporte técnico", prompt: "Tengo un problema técnico con mi cuenta" },
  { label: "Información de pedidos", prompt: "¿Cómo puedo rastrear mi pedido?" },
  { label: "Configuración", prompt: "Ayúdame con la configuración de mi perfil" },
  { label: "Reportar problema", prompt: "Quiero reportar un problema con el sistema" }
];

const suggestedQuestions = [
  "¿Cómo puedo agregar productos al carrito?",
  "¿Cuáles son los métodos de pago disponibles?",
  "¿Cómo cambio mi contraseña?",
  "¿Dónde veo el estado de mis pedidos?",
  "¿Cómo contacto con soporte técnico?",
  "¿Qué opciones de envío hay disponibles?"
];

export default function AIAssistantModal({ isOpen, onClose }: AIAssistantModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content: "¡Hola! Soy tu asistente IA de LogicQP. ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre productos, pedidos, configuración o cualquier otra cosa relacionada con el sistema.",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const simulateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simple AI responses based on keywords
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("producto") || lowerMessage.includes("catalogo")) {
      return "Para explorar productos, puedes usar el menú 'Catálogo' en la parte superior. Allí encontrarás todas las categorías, ofertas especiales y nuevos productos. También puedes usar la búsqueda para encontrar productos específicos por nombre o características.";
    }
    
    if (lowerMessage.includes("pedido") || lowerMessage.includes("orden")) {
      return "Puedes ver el estado de tus pedidos en 'Mi Cuenta' > 'Pedidos'. Allí encontrarás el historial completo, códigos de seguimiento y opciones para descargar facturas. Si necesitas ayuda con un pedido específico, proporciona el número de pedido.";
    }
    
    if (lowerMessage.includes("carrito") || lowerMessage.includes("comprar")) {
      return "Tu carrito de compras está disponible en 'Mi Cuenta' > 'Carrito'. Puedes agregar productos desde el catálogo, modificar cantidades, aplicar cupones de descuento y proceder al checkout cuando estés listo.";
    }
    
    if (lowerMessage.includes("configuracion") || lowerMessage.includes("perfil")) {
      return "Para configurar tu perfil, ve a 'Mi Cuenta' > 'Configuración'. Allí puedes actualizar tu información personal, preferencias de la aplicación, configurar notificaciones y cambiar tu contraseña.";
    }
    
    if (lowerMessage.includes("pago") || lowerMessage.includes("factura")) {
      return "Aceptamos múltiples métodos de pago: tarjetas de crédito/débito, transferencias bancarias y efectivo. Las facturas se generan automáticamente y puedes descargarlas desde la sección de pedidos.";
    }
    
    if (lowerMessage.includes("envio") || lowerMessage.includes("entrega")) {
      return "Ofrecemos envíos a todo el Ecuador. Los tiempos de entrega varían según la ubicación: Quito y Guayaquil (1-2 días), otras ciudades (3-5 días). Puedes rastrear tu envío con el código de seguimiento que recibirás por email.";
    }
    
    if (lowerMessage.includes("soporte") || lowerMessage.includes("problema") || lowerMessage.includes("error")) {
      return "Para soporte técnico, puedes contactarnos a través de: Email: soporte@logicqp.com, Teléfono: +593 2 123 4567, o usar el formulario de contacto en la sección de ayuda. También puedes reportar problemas directamente desde tu panel de usuario.";
    }
    
    if (lowerMessage.includes("inventario") || lowerMessage.includes("stock")) {
      return "El inventario se actualiza en tiempo real. Puedes ver la disponibilidad de productos en el catálogo. Si un producto está agotado, aparecerá marcado como 'Sin stock' y puedes activar notificaciones para cuando vuelva a estar disponible.";
    }
    
    // Default response
    return "Entiendo tu consulta. Te recomiendo explorar las diferentes secciones del menú para encontrar lo que necesitas. Si necesitas ayuda específica, puedes usar las preguntas sugeridas o contactar directamente con nuestro equipo de soporte.";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await simulateAIResponse(userMessage.content);
      
      // Add typing indicator
      const typingMessage: Message = {
        id: `typing-${Date.now()}`,
        type: "assistant",
        content: "",
        timestamp: new Date(),
        isTyping: true
      };
      
      setMessages(prev => [...prev, typingMessage]);
      
      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Replace typing indicator with actual response
      setMessages(prev => prev.map(msg => 
        msg.id === typingMessage.id 
          ? { ...msg, content: response, isTyping: false }
          : msg
      ));
    } catch (error) {
      console.error("Error generating AI response:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: "assistant",
        content: "Lo siento, hubo un error al procesar tu consulta. Por favor, intenta de nuevo o contacta con soporte técnico.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInputValue(prompt);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearChat = () => {
    setMessages([{
      id: "1",
      type: "assistant",
      content: "¡Hola! Soy tu asistente IA de LogicQP. ¿En qué puedo ayudarte hoy?",
      timestamp: new Date()
    }]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col">
        <CardHeader className="flex-shrink-0 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Asistente IA</CardTitle>
                <CardDescription className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>En línea</span>
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={clearChat}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Quick Actions */}
          <div className="p-4 border-b bg-gray-50">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Acciones Rápidas</h4>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action.prompt)}
                  className="text-xs"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex space-x-2 max-w-[80%] ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === "user" 
                        ? "bg-blue-600" 
                        : "bg-gradient-to-r from-blue-600 to-purple-600"
                    }`}>
                      {message.type === "user" ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className={`rounded-lg p-3 ${
                      message.type === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}>
                      {message.isTyping ? (
                        <div className="flex items-center space-x-1">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                          </div>
                          <span className="text-sm text-gray-500 ml-2">Escribiendo...</span>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm">{message.content}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs opacity-70">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                            {message.type === "assistant" && (
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    copyToClipboard(message.content);
                                  }}
                                  className="h-6 w-6 p-0 hover:bg-gray-200"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('👍 Me gusta');
                                  }}
                                  className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  <ThumbsUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('👎 No me gusta');
                                  }}
                                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <ThumbsDown className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className="p-4 border-t bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Preguntas Sugeridas</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQuickAction(question)}
                    className="justify-start text-left h-auto p-3 text-xs"
                  >
                    <MessageSquare className="h-3 w-3 mr-2 flex-shrink-0" />
                    <span className="truncate">{question}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu pregunta aquí..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
