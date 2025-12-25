import React, { useState, useEffect } from 'react';
import { Badge, IconButton, Menu, MenuItem, Typography, Box, Divider, ListItemIcon } from '@mui/material';
import { Notifications, Work, Message, Person, CheckCircle } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'job' | 'message' | 'application' | 'system';
    read: boolean;
    timestamp: string;
}

const NotificationBadge: React.FC = () => {
    const { user } = useAuth();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        loadNotifications();

        // Auto-refresh every 10 seconds
        const interval = setInterval(loadNotifications, 10000);

        return () => clearInterval(interval);
    }, [user]);

    const loadNotifications = async () => {
        if (!user?.email) return;

        try {
            // Fetch from backend
            const { notificationAPI } = await import('../../services/api');
            const backendNotifications = await notificationAPI.getNotifications();

            const realNotifications = backendNotifications.map((n: any) => ({
                id: n.id,
                title: n.type === 'accepted' ? 'Application Shortlisted' : n.type === 'rejected' ? 'Application Rejected' : 'New Notification',
                message: n.message,
                type: n.type,
                read: n.isRead !== undefined ? n.isRead : n.read, // Handle both potential JSON fields
                timestamp: n.createdAt
            }));
            setNotifications(realNotifications);
        } catch (error) {
            console.error("Failed to load notifications", error);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const markAsRead = async (id: string) => {
        if (!user?.email) return;

        try {
            const { notificationAPI } = await import('../../services/api');
            // id from frontend might be string, backend expects number
            await notificationAPI.markAsRead(Number(id));

            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'job': return <Work fontSize="small" />;
            case 'message': return <Message fontSize="small" />;
            case 'application': return <Person fontSize="small" />;
            default: return <Notifications fontSize="small" />;
        }
    };

    return (
        <>
            <IconButton color="inherit" onClick={handleClick}>
                <Badge badgeContent={unreadCount} color="error">
                    <Notifications />
                </Badge>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    sx: { width: 350, maxHeight: 400 }
                }}
            >
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Notifications ({unreadCount} new)
                    </Typography>
                </Box>

                {notifications.length === 0 ? (
                    <MenuItem>
                        <Typography variant="body2" color="text.secondary">
                            No notifications
                        </Typography>
                    </MenuItem>
                ) : (
                    notifications.map((notification, index) => (
                        <Box key={notification.id}>
                            <MenuItem
                                onClick={() => {
                                    markAsRead(notification.id);
                                    handleClose();
                                }}
                                sx={{
                                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                                    alignItems: 'flex-start',
                                    py: 2
                                }}
                            >
                                <ListItemIcon sx={{ mt: 0.5 }}>
                                    {getIcon(notification.type)}
                                </ListItemIcon>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                        {notification.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {notification.message}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {new Date(notification.timestamp).toLocaleString()}
                                    </Typography>
                                </Box>
                                {!notification.read && (
                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', ml: 1 }} />
                                )}
                            </MenuItem>
                            {index < notifications.length - 1 && <Divider />}
                        </Box>
                    ))
                )}

                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
                    <Typography variant="body2" color="primary" sx={{ cursor: 'pointer' }}>
                        View All Notifications
                    </Typography>
                </Box>
            </Menu>
        </>
    );
};

export default NotificationBadge;
