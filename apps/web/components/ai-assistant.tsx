"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'error' | 'blocked';
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
      content: '¡Hola! Soy tu asistente farmacéutico IA. ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre medicamentos, dosis, interacciones o cualquier consulta farmacéutica.',
      timestamp: new Date(),
      status: 'sent'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Hook personalizado para monitorear la red
  const { 
    networkStatus, 
    isBlocked, 
    blockReason, 
    retryConnection: retryNetworkConnection, 
    unblock, 
    markActivity 
  } = useNetworkStatus();
  
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'error'>('connected');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  // Función para hacer scroll automático
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Scroll automático cuando hay nuevos mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Función para verificar conexión
  const checkConnection = useCallback(async () => {
    try {
      setConnectionStatus('connecting');
      
      // Simular verificación de conexión
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Verificar si hay problemas de red
             if (navigator.onLine) {
         setConnectionStatus('connected');
         unblock();
         setRetryCount(0);
       } else {
         setConnectionStatus('error');
       }
     } catch (error) {
       setConnectionStatus('error');
     }
  }, []);

  // Verificar conexión al montar el componente
  useEffect(() => {
    checkConnection();
    
    // Verificar conexión cada 30 segundos
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, [checkConnection]);

  // Función para enviar mensaje
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading || isBlocked) return;
    
    // Marcar actividad para evitar bloqueos por inactividad
    markActivity();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setRetryCount(0);

    // Simular envío del mensaje
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
      ));
    }, 500);

    try {
      // Simular respuesta del asistente IA
      await new Promise((resolve) => {
        timeoutRef.current = setTimeout(resolve, 2000 + Math.random() * 3000);
      });

      // Verificar si el usuario canceló
      if (timeoutRef.current) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: generateAIResponse(content),
        timestamp: new Date(),
          status: 'sent'
      };

      setMessages(prev => [...prev, assistantMessage]);
                 setIsLoading(false);
         unblock();
       }
     } catch (error) {
       console.error('Error en respuesta IA:', error);
       
       const errorMessage: Message = {
         id: (Date.now() + 1).toString(),
         role: 'assistant',
         content: 'Lo siento, he tenido un problema técnico. Por favor, intenta de nuevo en unos momentos.',
         timestamp: new Date(),
         status: 'error'
       };

       setMessages(prev => [...prev, errorMessage]);
       setIsLoading(false);
     }
  }, [isLoading, isBlocked]);

  // Función para generar respuesta IA simulada
  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('paracetamol') || input.includes('acetaminofen')) {
      return 'El paracetamol es un analgésico y antipirético seguro. Dosis recomendada: 500-1000mg cada 4-6 horas, máximo 4g por día. No tomar con alcohol y consultar al médico si tienes problemas hepáticos.';
    }
    
    if (input.includes('ibuprofeno')) {
      return 'El ibuprofeno es un antiinflamatorio no esteroideo (AINE). Dosis: 200-400mg cada 4-6 horas. Tomar con alimentos para evitar irritación gástrica. No recomendado en personas con problemas cardíacos.';
    }
    
    if (input.includes('vitamina c') || input.includes('vitamina c')) {
      return 'La vitamina C es un antioxidante esencial. Dosis diaria recomendada: 75-90mg para adultos. Puede ayudar con el sistema inmune, pero no previene resfriados. Tomar con alimentos para mejor absorción.';
    }
    
    if (input.includes('antibiótico') || input.includes('antibiotico')) {
      return 'Los antibióticos solo deben tomarse bajo prescripción médica. Nunca automedicarse con antibióticos. Es importante completar todo el tratamiento prescrito para evitar resistencia bacteriana.';
    }
    
    if (input.includes('interacción') || input.includes('interaccion')) {
      return 'Las interacciones medicamentosas son importantes. Siempre informa a tu farmacéutico sobre todos los medicamentos que tomas, incluyendo suplementos y hierbas. Consulta antes de combinar medicamentos.';
    }
    
    if (input.includes('dosis') || input.includes('cantidad')) {
      return 'La dosis correcta es crucial para la seguridad. Siempre sigue las instrucciones del médico o farmacéutico. No aumentes la dosis sin consultar. En caso de duda, pregunta antes de tomar.';
    }
    
    if (input.includes('efectos secundarios') || input.includes('efectos adversos')) {
      return 'Todos los medicamentos pueden tener efectos secundarios. Los más comunes incluyen náuseas, mareos o somnolencia. Si experimentas efectos graves, suspende el medicamento y consulta inmediatamente.';
    }
    
    if (input.includes('caducidad') || input.includes('vencimiento')) {
      return 'Nunca tomes medicamentos vencidos. La fecha de caducidad garantiza la eficacia y seguridad. Revisa regularmente tu botiquín y desecha medicamentos vencidos de forma segura.';
    }
    
    if (input.includes('almacenamiento') || input.includes('guardar')) {
      return 'Guarda los medicamentos en un lugar fresco y seco, lejos de la luz directa y del alcance de los niños. Algunos requieren refrigeración. Lee siempre las instrucciones de almacenamiento.';
    }
    
    return 'Gracias por tu consulta. Como asistente farmacéutico, puedo ayudarte con información general sobre medicamentos, pero recuerda que no reemplazo la consulta médica. Para dosis específicas o problemas de salud, consulta siempre con un profesional de la salud.';
  };

  // Función para reintentar conexión
  const retryConnection = useCallback(() => {
         if (retryCount >= 3) {
       return;
     }

    setRetryCount(prev => prev + 1);
    setIsLoading(true);

    retryTimeoutRef.current = setTimeout(() => {
      checkConnection();
      setIsLoading(false);
    }, 2000 * (retryCount + 1));
  }, [retryCount, checkConnection]);

  // Función para limpiar conversación
  const clearConversation = useCallback(() => {
         setMessages([
       {
         id: '1',
         role: 'assistant',
         content: '¡Hola! Soy tu asistente farmacéutico IA. ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre medicamentos, dosis, interacciones o cualquier consulta farmacéutica.',
         timestamp: new Date(),
         status: 'sent'
       }
     ]);
     unblock();
     setRetryCount(0);
  }, []);

  // Función para cancelar operación
  const cancelOperation = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = undefined;
    }
    
    setIsLoading(false);
    
    // Marcar mensaje como cancelado
    setMessages(prev => prev.map(msg => 
      msg.status === 'sending' ? { ...msg, status: 'error' } : msg
    ));
  }, []);

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, []);

  // Función para manejar envío
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading && !isBlocked) {
      sendMessage(inputValue);
    }
  }, [inputValue, isLoading, isBlocked, sendMessage]);

  // Función para manejar tecla Enter
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  return (
    <>
      {/* Botón flotante */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 z-50 ${className}`}
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Modal del asistente */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-end z-50 p-4">
          <Card className="w-full max-w-md h-[600px] flex flex-col bg-white shadow-2xl">
            {/* Header */}
            <CardHeader className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Asistente IA LogicQP</CardTitle>
                <div className="flex items-center space-x-2">
                       <Badge 
                         variant={networkStatus.isOnline ? 'default' : 'destructive'}
                         className="text-xs"
                       >
                         {networkStatus.isOnline && <CheckCircle className="h-3 w-3 mr-1" />}
                         {!networkStatus.isOnline && <AlertCircle className="h-3 w-3 mr-1" />}
                         {networkStatus.isOnline ? 'En línea' : 'Sin conexión'}
                       </Badge>
                       {isBlocked && (
                         <Badge variant="destructive" className="text-xs">
                           <AlertCircle className="h-3 w-3 mr-1" />
                           {blockReason || 'Bloqueado'}
                         </Badge>
                       )}
                       {networkStatus.isSlow && (
                         <Badge variant="secondary" className="text-xs">
                           <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                           Lento
                         </Badge>
                       )}
                     </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>

            {/* Mensajes */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                          ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                      {message.role === 'assistant' && (
                        <Bot className="h-4 w-4 mt-1 flex-shrink-0" />
                      )}
                      {message.role === 'user' && (
                        <User className="h-4 w-4 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs opacity-70">
                            {message.timestamp.toLocaleTimeString('es-ES', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          {message.status === 'sending' && (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          )}
                          {message.status === 'error' && (
                            <AlertCircle className="h-3 w-3 text-red-500" />
                          )}
                      </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
              {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                      <Bot className="h-4 w-4" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
            </CardContent>

            {/* Input y controles */}
            <div className="flex-shrink-0 p-4 border-t">
              {isBlocked && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-700">
                        Conexión bloqueada. Reintentos: {retryCount}/3
                      </span>
              </div>
                    <Button
                      variant="outline"
                      size="sm"
                   onClick={retryNetworkConnection}
                   disabled={isLoading}
                   className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                   <RefreshCw className="h-4 w-4 mr-1" />
                   Reintentar
                    </Button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex space-x-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe tu consulta farmacéutica..."
                  disabled={isLoading || isBlocked}
                    className="flex-1"
                  />
                  <Button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading || isBlocked}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>

              {/* Botones de control */}
              <div className="flex justify-between items-center mt-3">
                                 <Button
                   variant="outline"
                   size="sm"
                   onClick={clearConversation}
                   className="text-gray-600"
                 >
                   Limpiar chat
                 </Button>
                 
                 {isBlocked && (
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={unblock}
                     className="text-green-600 border-green-300 hover:bg-green-50"
                   >
                     <CheckCircle className="h-4 w-4 mr-1" />
                     Desbloquear
                   </Button>
                 )}
                
                {isLoading && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={cancelOperation}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Cancelar
                  </Button>
                )}
                </div>
              </div>
          </Card>
        </div>
      )}
    </>
  );
}
