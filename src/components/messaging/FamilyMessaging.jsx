import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function FamilyMessaging() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadMessages();
    
    // Subscribe to new messages
    const unsubscribe = base44.entities.FamilyMessage.subscribe((event) => {
      if (event.type === 'create') {
        loadMessages();
      }
    });

    return unsubscribe;
  }, []);

  const loadMessages = async () => {
    try {
      const response = await base44.functions.invoke('getFamilyMessages', {});
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (messageType = 'general') => {
    if (!newMessage.trim() && messageType === 'general') return;

    setSending(true);
    try {
      let content = newMessage;
      if (messageType === 'status_safe') {
        content = '✅ I am safe and secure';
      } else if (messageType === 'status_needs_assistance') {
        content = '🆘 I need assistance';
      }

      await base44.functions.invoke('sendFamilyMessage', {
        content,
        message_type: messageType
      });

      setNewMessage('');
      toast.success(messageType === 'general' ? 'Message sent' : 'Status updated');
      loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await base44.functions.invoke('markMessageRead', { message_id: messageId });
      loadMessages();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const getMessageIcon = (type) => {
    switch (type) {
      case 'status_safe':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'status_needs_assistance':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <MessageCircle className="w-4 h-4 text-blue-600" />;
    }
  };

  const getMessageStyle = (type) => {
    switch (type) {
      case 'status_safe':
        return 'bg-green-50 border-green-200';
      case 'status_needs_assistance':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Family Messages
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Quick Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => sendMessage('status_safe')}
            disabled={sending}
            className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            I'm Safe
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => sendMessage('status_needs_assistance')}
            disabled={sending}
            className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Need Help
          </Button>
        </div>

        {/* Message Input */}
        <div className="space-y-2">
          <Textarea
            placeholder="Send a message to your family..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            rows={3}
          />
          <Button
            onClick={() => sendMessage('general')}
            disabled={!newMessage.trim() || sending}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Message
          </Button>
        </div>

        {/* Messages List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No messages yet</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-lg border ${getMessageStyle(msg.message_type)}`}
                onClick={() => markAsRead(msg.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    {getMessageIcon(msg.message_type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{msg.sender_name}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(msg.created_date).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{msg.content}</p>
                    </div>
                  </div>
                  {msg.read_by && msg.read_by.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {msg.read_by.length} read
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}