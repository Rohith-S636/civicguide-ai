'use client';

import { useTranslations } from 'next-intl';
import { PageWrapper } from '@/components/PageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Send, Loader } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function ChatPage() {
  const t = useTranslations();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m CivicGuide, your AI assistant for learning about Indian elections and civics. How can I help you today?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'That\'s a great question! In Indian elections, the voting process follows strict protocols set by the Election Commission of India. Here are the key steps...',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <PageWrapper
      title="Chat with CivicGuide AI"
      description="Ask questions about elections, constitution, and civic participation"
      breadcrumbs={[{ label: 'Chat' }]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Area */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            {/* Chat Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-saffron text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-900 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === 'user'
                          ? 'text-orange-100'
                          : 'text-gray-500'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-4 py-3 rounded-lg rounded-bl-none">
                    <Loader className="w-4 h-4 animate-spin text-gray-600" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything about elections..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Topics Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Topics</CardTitle>
              <CardDescription>Popular questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                onClick={() => setInput('How do I register to vote?')}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-saffron hover:text-white rounded transition-colors"
              >
                Voter Registration
              </button>
              <button
                onClick={() => setInput('What are fundamental rights?')}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-india-green hover:text-white rounded transition-colors"
              >
                Fundamental Rights
              </button>
              <button
                onClick={() => setInput('Explain the voting process')}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-navy hover:text-white rounded transition-colors"
              >
                Voting Process
              </button>
              <button
                onClick={() => setInput('What are election forms?')}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-purple-600 hover:text-white rounded transition-colors"
              >
                Election Forms
              </button>
              <button
                onClick={() => setInput('Explain electoral bonds')}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-pink-600 hover:text-white rounded transition-colors"
              >
                Electoral Bonds
              </button>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Conversation Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-600 space-y-2">
              <p>• Ask specific questions for better answers</p>
              <p>• Use simple language</p>
              <p>• Feel free to ask follow-up questions</p>
              <p>• Our AI cites sources when available</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
