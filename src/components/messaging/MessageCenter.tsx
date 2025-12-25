import React, { useState, useEffect, useCallback } from 'react';
import { Box, Paper, List, ListItem, ListItemText, TextField, Button, Typography, Avatar, Divider, Chip } from '@mui/material';
import { Send } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { messageAPI, userAPI } from '../../services/api';

interface Message {
    id: number;
    senderId: number;
    receiverId: number;
    content: string;
    sentAt: string;
    isRead: boolean;
}

interface Conversation {
    partnerId: number;
    partnerName: string;
    partnerEmail: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
}

const MessageCenter: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);

    useEffect(() => {
        if (location.state && location.state.partnerId) {
            setSelectedConversationId(location.state.partnerId);
        }
    }, [location.state]);
    const [messages, setMessages] = useState<Message[]>([]); // Current conversation messages
    const [allMessages, setAllMessages] = useState<Message[]>([]); // All fetched messages
    const [newMessage, setNewMessage] = useState('');
    const [partnersCache, setPartnersCache] = useState<Record<number, any>>({});

    const currentUserId = user?.id ? (typeof user.id === 'string' ? parseInt(user.id) : user.id) : null;

    const loadData = useCallback(async () => {
        if (!currentUserId) return;

        try {
            const msgs: Message[] = await messageAPI.getMessages();
            setAllMessages(msgs);

            // Process conversations immediately with the loaded messages
            await processConversations(msgs, currentUserId);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }, [currentUserId]);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, [loadData]);

    // Update displayed messages when selected conversation or allMessages changes
    useEffect(() => {
        if (selectedConversationId && allMessages.length > 0 && currentUserId) {
            const conversationMessages = allMessages.filter(
                m => (m.senderId === currentUserId && m.receiverId === selectedConversationId) ||
                    (m.senderId === selectedConversationId && m.receiverId === currentUserId)
            ).sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
            setMessages(conversationMessages);
        }
    }, [selectedConversationId, allMessages, currentUserId]);

    const processConversations = async (msgs: Message[], userId: number) => {
        const partners = new Set<number>();
        const convMap = new Map<number, Message[]>();

        msgs.forEach(msg => {
            const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
            partners.add(partnerId);
            if (!convMap.has(partnerId)) {
                convMap.set(partnerId, []);
            }
            convMap.get(partnerId)?.push(msg);
        });

        const newConversations: Conversation[] = [];
        const unknownPartners: number[] = [];

        // Check cache for partners
        partners.forEach(pid => {
            if (!partnersCache[pid]) {
                unknownPartners.push(pid);
            }
        });

        // Create a local cache that includes existing cache
        let currentCache = { ...partnersCache };

        // Fetch unknown partners
        if (unknownPartners.length > 0) {
            const updates: Record<number, any> = {};

            await Promise.all(unknownPartners.map(async (pid) => {
                try {
                    const pUser = await userAPI.getUserById(pid);
                    if (pUser) {
                        updates[pid] = pUser;
                    } else {
                        updates[pid] = { firstName: 'Unknown', lastName: 'User', email: 'unknown@example.com' };
                    }
                } catch (e) {
                    updates[pid] = { firstName: 'Unknown', lastName: 'User', email: 'unknown@example.com' };
                }
            }));

            if (Object.keys(updates).length > 0) {
                // Update local cache with new data
                currentCache = { ...currentCache, ...updates };
                // Update state
                setPartnersCache(prev => ({ ...prev, ...updates }));
            }
        }

        // Build conversation list using the up-to-date local cache
        partners.forEach(pid => {
            const partnerMsgs = convMap.get(pid) || [];
            const lastMsg = partnerMsgs.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())[0];

            const partnerData = currentCache[pid] || { firstName: 'Loading...', lastName: '' };

            newConversations.push({
                partnerId: pid,
                partnerName: partnerData.email ? `${partnerData.firstName} ${partnerData.lastName}` : 'Loading...',
                partnerEmail: partnerData.email || '',
                lastMessage: lastMsg?.content || '',
                lastMessageTime: lastMsg?.sentAt || '',
                unreadCount: partnerMsgs.filter(m => m.receiverId === userId && !m.isRead).length
            });
        });

        setConversations(newConversations.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()));
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConversationId || !currentUserId) return;

        try {
            const messageData = {
                senderId: currentUserId,
                receiverId: selectedConversationId,
                content: newMessage
            };

            await messageAPI.sendMessage(messageData);
            setNewMessage('');
            loadData(); // Refresh immediately
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
                    py: 4,
                    mb: 4
                }}
            >
                <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: 'white', textAlign: 'center', mb: 2 }}>
                        Messages
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', textAlign: 'center', fontWeight: 400 }}>
                        Stay connected
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>
                <Box display="flex" height="600px" gap={2}>
                    {/* Conversations List */}
                    <Paper sx={{ width: 350 }}>
                        <Typography variant="h6" sx={{ p: 2 }}>
                            Conversations
                        </Typography>
                        <Divider />
                        <List sx={{ height: 'calc(100% - 60px)', overflow: 'auto' }}>
                            {conversations.length === 0 ? (
                                <Box p={3} textAlign="center">
                                    <Typography color="text.secondary">
                                        No conversations yet.
                                    </Typography>
                                </Box>
                            ) : (
                                conversations.map((conversation) => (
                                    <ListItem
                                        key={conversation.partnerId}
                                        sx={{
                                            cursor: 'pointer',
                                            bgcolor: selectedConversationId === conversation.partnerId ? 'action.selected' : 'transparent',
                                            '&:hover': { bgcolor: 'action.hover' }
                                        }}
                                        onClick={() => setSelectedConversationId(conversation.partnerId)}
                                    >
                                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                            {conversation.partnerName?.[0] || 'U'}
                                        </Avatar>
                                        <ListItemText
                                            primary={
                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                    <Typography variant="subtitle2" fontWeight={600}>
                                                        {conversation.partnerName}
                                                    </Typography>
                                                    {conversation.unreadCount > 0 && (
                                                        <Chip label={conversation.unreadCount} size="small" color="error" />
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <>
                                                    <Typography variant="body2" noWrap>
                                                        {conversation.lastMessage}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {conversation.lastMessageTime ? new Date(conversation.lastMessageTime).toLocaleString() : ''}
                                                    </Typography>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                ))
                            )}
                        </List>
                    </Paper>

                    {/* Messages Area */}
                    <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {selectedConversationId ? (
                            <>
                                <Box sx={{ flex: 1, p: 2, overflow: 'auto', bgcolor: '#f5f5f5' }}>
                                    {messages.length === 0 ? (
                                        <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                                            <Typography color="text.secondary">
                                                No messages yet.
                                            </Typography>
                                        </Box>
                                    ) : (
                                        messages.map((message) => (
                                            <Box
                                                key={message.id}
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: message.senderId === currentUserId ? 'flex-end' : 'flex-start',
                                                    mb: 2,
                                                }}
                                            >
                                                <Paper
                                                    sx={{
                                                        p: 2,
                                                        maxWidth: '70%',
                                                        bgcolor: message.senderId === currentUserId ? 'primary.main' : 'white',
                                                        color: message.senderId === currentUserId ? 'white' : 'text.primary',
                                                    }}
                                                >
                                                    <Typography variant="body1">{message.content}</Typography>
                                                    <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5 }}>
                                                        {new Date(message.sentAt).toLocaleString()}
                                                    </Typography>
                                                </Paper>
                                            </Box>
                                        ))
                                    )}
                                </Box>

                                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'white' }}>
                                    <Box display="flex" gap={1}>
                                        <TextField
                                            fullWidth
                                            multiline
                                            maxRows={3}
                                            placeholder="Type a message..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                        />
                                        <Button
                                            variant="contained"
                                            onClick={sendMessage}
                                            disabled={!newMessage.trim()}
                                            sx={{ minWidth: 'auto', px: 3 }}
                                        >
                                            <Send />
                                        </Button>
                                    </Box>
                                </Box>
                            </>
                        ) : (
                            <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                                <Typography variant="h6" color="text.secondary">
                                    Select a conversation
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
};

export default MessageCenter;
