import React, { useState, useEffect, useRef } from 'react';
import { nanoid } from 'nanoid';
import { 
  Card, CardContent, CardDescription, 
  CardFooter, CardHeader, CardTitle 
} from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  Users, UserPlus, Copy, Link2, Share2, Settings, 
  Crown, Shield, Eye, Edit3, X, MessageSquare, Bell,
  BellOff, Send, Clock, MoreVertical, UserCheck, UserX,
  UserMinus, Save, AlignJustify
} from 'lucide-react';

// Example data for collaborators
const MOCK_COLLABORATORS = [
  {
    id: '1',
    name: 'Jane Developer',
    email: 'jane@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/micah/svg?seed=jane',
    role: 'owner',
    active: true,
    lastActive: new Date(),
    cursor: { line: 5, ch: 10 }
  },
  {
    id: '2',
    name: 'John Coder',
    email: 'john@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/micah/svg?seed=john',
    role: 'editor',
    active: true,
    lastActive: new Date(),
    cursor: { line: 12, ch: 5 }
  },
  {
    id: '3',
    name: 'Alex Designer',
    email: 'alex@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/micah/svg?seed=alex',
    role: 'viewer',
    active: false,
    lastActive: new Date(Date.now() - 1000 * 60 * 15),
    cursor: null
  },
];

// Example chat messages
const MOCK_MESSAGES = [
  {
    id: '1',
    sender: MOCK_COLLABORATORS[0],
    content: 'I just updated the authentication component',
    timestamp: new Date(Date.now() - 1000 * 60 * 30)
  },
  {
    id: '2',
    sender: MOCK_COLLABORATORS[1],
    content: 'Looks good! I found a small bug in the login form though',
    timestamp: new Date(Date.now() - 1000 * 60 * 25)
  },
  {
    id: '3',
    sender: MOCK_COLLABORATORS[0],
    content: 'Can you add a comment where you found the issue?',
    timestamp: new Date(Date.now() - 1000 * 60 * 20)
  },
  {
    id: '4',
    sender: MOCK_COLLABORATORS[1],
    content: 'Done, check line 45. The validation was missing a case',
    timestamp: new Date(Date.now() - 1000 * 60 * 15)
  },
];

// Role colors and descriptions
const ROLES = {
  owner: {
    color: 'bg-amber-500',
    icon: Crown,
    description: 'Can edit, invite others, and manage the session'
  },
  editor: {
    color: 'bg-blue-500',
    icon: Edit3,
    description: 'Can edit the code but cannot manage permissions'
  },
  viewer: {
    color: 'bg-gray-500',
    icon: Eye,
    description: 'Can only view the code, not make changes'
  },
};

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: 'owner' | 'editor' | 'viewer';
  active: boolean;
  lastActive: Date;
  cursor: { line: number; ch: number } | null;
}

interface ChatMessage {
  id: string;
  sender: User;
  content: string;
  timestamp: Date;
}

interface CollaborationSession {
  id: string;
  name: string;
  createdAt: Date;
  hostId: string;
  inviteCode: string;
  isActive: boolean;
}

/**
 * Real-Time Collaboration Component
 * 
 * This component enables multi-user editing with presence awareness,
 * live cursors, chat, and collaboration controls.
 */
export default function RealTimeCollaboration() {
  const [collaborators, setCollaborators] = useState<User[]>(MOCK_COLLABORATORS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [showChat, setShowChat] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [sessionActive, setSessionActive] = useState(true);
  const [currentTab, setCurrentTab] = useState<'collaborators' | 'chat'>('collaborators');
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Current user (simulated as the owner in this example)
  const currentUser = collaborators[0];
  
  // Current session
  const [session, setSession] = useState<CollaborationSession>({
    id: 'session-1',
    name: 'Cloud IDE Project',
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
    hostId: currentUser.id,
    inviteCode: 'cloud-ide-xyz123',
    isActive: true,
  });
  
  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);
  
  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Get relative time (e.g., "5 min ago")
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));
    
    if (diffMin < 1) return 'just now';
    if (diffMin === 1) return '1 min ago';
    if (diffMin < 60) return `${diffMin} mins ago`;
    
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  };
  
  // Send a new chat message
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message: ChatMessage = {
      id: nanoid(),
      sender: currentUser,
      content: newMessage,
      timestamp: new Date(),
    };
    
    setChatMessages([...chatMessages, message]);
    setNewMessage('');
    
    // In a real app, this would send the message to other users via WebSocket
  };
  
  // Generate a new invite code
  const generateInviteCode = () => {
    const newCode = `cloud-ide-${nanoid(6)}`;
    setSession({ ...session, inviteCode: newCode });
    
    toast({
      title: "New invite code generated",
      description: "The previous code is no longer valid.",
    });
  };
  
  // Copy invite link to clipboard
  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/join/${session.inviteCode}`;
    navigator.clipboard.writeText(inviteLink);
    
    toast({
      title: "Invite link copied",
      description: "You can now share it with collaborators.",
    });
  };
  
  // Update user role
  const updateUserRole = (userId: string, newRole: 'owner' | 'editor' | 'viewer') => {
    // In a real app, this would update the role on the server
    setCollaborators(collaborators.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
    
    toast({
      title: "Role updated",
      description: `User's permission changed to ${newRole}.`,
    });
  };
  
  // Remove a user from the session
  const removeUser = (userId: string) => {
    // In a real app, this would remove the user on the server
    setCollaborators(collaborators.filter(user => user.id !== userId));
    
    toast({
      title: "User removed",
      description: "The user has been removed from the collaboration session.",
    });
  };
  
  // End the collaboration session
  const endSession = () => {
    // In a real app, this would end the session on the server
    setSessionActive(false);
    setSession({ ...session, isActive: false });
    
    toast({
      title: "Session ended",
      description: "The collaboration session has been terminated.",
    });
  };
  
  // Render collaborator list
  const renderCollaborators = () => {
    return (
      <div className="space-y-3">
        {collaborators.map((user) => {
          const RoleIcon = ROLES[user.role].icon;
          
          return (
            <div 
              key={user.id} 
              className={cn(
                "p-3 rounded-lg flex items-center gap-3",
                user.active ? "bg-muted/60" : "bg-background border",
                user.id === currentUser.id && "border-primary/20"
              )}
            >
              <div className="relative">
                <Avatar className="h-9 w-9 border">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                
                {/* Active status indicator */}
                {user.active && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background"></span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">
                    {user.name}
                    {user.id === currentUser.id && " (You)"}
                  </p>
                  
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "px-1.5 h-5 text-[10px] uppercase font-semibold",
                      ROLES[user.role].color
                    )}
                  >
                    {user.role}
                  </Badge>
                </div>
                
                <p className="text-xs text-muted-foreground truncate">
                  {user.active ? (
                    "Currently active"
                  ) : (
                    `Last active ${getRelativeTime(user.lastActive)}`
                  )}
                </p>
              </div>
              
              {/* User controls (only shown for current user or if current user is owner) */}
              {(currentUser.role === 'owner' && user.id !== currentUser.id) && (
                <div className="relative">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Manage Collaborator</DialogTitle>
                        <DialogDescription>
                          Update permissions or remove {user.name} from this session.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="py-4">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium mb-2">Change Role</h4>
                            <div className="space-y-2">
                              {(['editor', 'viewer'] as const).map((role) => (
                                <div 
                                  key={role}
                                  className={cn(
                                    "flex items-center justify-between p-2 rounded-md",
                                    user.role === role ? "bg-muted" : "hover:bg-muted",
                                    "cursor-pointer"
                                  )}
                                  onClick={() => updateUserRole(user.id, role)}
                                >
                                  <div className="flex items-center gap-2">
                                    {role === 'editor' ? (
                                      <Edit3 className="h-4 w-4 text-blue-500" />
                                    ) : (
                                      <Eye className="h-4 w-4 text-gray-500" />
                                    )}
                                    <span className="capitalize">{role}</span>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {ROLES[role].description}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="pt-2">
                            <Button
                              variant="destructive"
                              onClick={() => removeUser(user.id)}
                              className="w-full"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Remove from Session
                            </Button>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };
  
  // Render chat interface
  const renderChat = () => {
    return (
      <div className="flex flex-col h-full">
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto space-y-4 pr-1"
        >
          {chatMessages.map((message) => {
            const isCurrentUser = message.sender.id === currentUser.id;
            
            return (
              <div 
                key={message.id} 
                className={cn(
                  "flex",
                  isCurrentUser ? "justify-end" : "justify-start"
                )}
              >
                <div className="flex max-w-[80%]">
                  {!isCurrentUser && (
                    <Avatar className="h-8 w-8 mr-2 mt-1">
                      <AvatarImage src={message.sender.avatarUrl} alt={message.sender.name} />
                      <AvatarFallback>{message.sender.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div>
                    {!isCurrentUser && (
                      <p className="text-xs font-medium mb-1">{message.sender.name}</p>
                    )}
                    
                    <div className={cn(
                      "rounded-lg p-3",
                      isCurrentUser 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted"
                    )}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    
                    <p className="text-[10px] text-muted-foreground mt-1 px-1">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="pt-4 border-t mt-2">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    );
  };
  
  // Render invite dialog for adding new collaborators
  const renderInviteDialog = () => {
    return (
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Invite Collaborators</DialogTitle>
            <DialogDescription>
              Share this link or code with others to invite them to this collaboration session.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-link">Invite Link</Label>
              <div className="flex gap-2">
                <Input
                  id="invite-link"
                  value={`${window.location.origin}/join/${session.inviteCode}`}
                  readOnly
                  className="flex-1"
                />
                <Button variant="outline" onClick={copyInviteLink} size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="invite-code">Invite Code</Label>
              <div className="flex gap-2">
                <Input
                  id="invite-code"
                  value={session.inviteCode}
                  readOnly
                  className="flex-1 font-mono"
                />
                <Button variant="outline" onClick={generateInviteCode} size="icon">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Users can enter this code manually to join your session
              </p>
            </div>
            
            <div className="space-y-2 pt-2">
              <Label>Default Permission</Label>
              <div className="border rounded-md p-3 space-y-4">
                {(['editor', 'viewer'] as const).map((role) => (
                  <div 
                    key={role}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {role === 'editor' ? (
                        <Edit3 className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                      <span className="text-sm capitalize">{role}</span>
                      <span className="text-xs text-muted-foreground">
                        {ROLES[role].description}
                      </span>
                    </div>
                    
                    <input
                      type="radio"
                      name="default-role"
                      value={role}
                      defaultChecked={role === 'editor'}
                      className="h-4 w-4 text-primary bg-background border-muted rounded-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Close
            </Button>
            <Button onClick={copyInviteLink}>
              <Link2 className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Real-Time Collaboration
            </CardTitle>
            <CardDescription>
              Work together in real-time with multi-user editing and chat
            </CardDescription>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Badge 
              variant={sessionActive ? "default" : "outline"}
              className={cn(
                "px-2 h-6",
                sessionActive ? "bg-green-500 hover:bg-green-600" : ""
              )}
            >
              {sessionActive ? "Active Session" : "Session Ended"}
            </Badge>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            >
              {notificationsEnabled ? (
                <Bell className="h-4 w-4" />
              ) : (
                <BellOff className="h-4 w-4" />
              )}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowChat(!showChat)}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Collaboration Settings</DialogTitle>
                  <DialogDescription>
                    Configure your collaboration preferences and permissions.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notifications">Notifications</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive alerts when collaborators join, leave, or send messages
                      </p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto Save</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically save changes to the file as you type
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Cursors</Label>
                      <p className="text-xs text-muted-foreground">
                        Show other users' cursors and selections
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Viewers to Chat</Label>
                      <p className="text-xs text-muted-foreground">
                        Let users with view-only access participate in chat
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button
                    variant="destructive"
                    onClick={endSession}
                    disabled={!sessionActive}
                  >
                    End Collaboration Session
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Main collaboration panel */}
          <div className={cn(
            "flex-1 min-w-0 border rounded-lg overflow-hidden",
            showChat ? "lg:w-3/5" : "w-full"
          )}>
            <div className="p-4 bg-muted border-b flex justify-between items-center">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <AlignJustify className="h-4 w-4" />
                <span>Collaboration Panel</span>
              </h3>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowInviteDialog(true)}
                disabled={!sessionActive || currentUser.role !== 'owner'}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Invite
              </Button>
            </div>
            
            <div className="p-4">
              <Tabs 
                value={currentTab}
                onValueChange={(value) => setCurrentTab(value as 'collaborators' | 'chat')}
                className="w-full"
              >
                <TabsList className="w-full lg:hidden">
                  <TabsTrigger value="collaborators" className="flex-1">
                    <Users className="h-4 w-4 mr-2" />
                    Collaborators ({collaborators.length})
                  </TabsTrigger>
                  <TabsTrigger value="chat" className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat ({chatMessages.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="collaborators" className="mt-4 h-[400px] overflow-y-auto">
                  {renderCollaborators()}
                </TabsContent>
                
                <TabsContent value="chat" className="mt-4 h-[400px]">
                  <div className="h-full">
                    {renderChat()}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Chat panel (only visible on larger screens or when toggled) */}
          {showChat && (
            <div className="lg:w-2/5 border rounded-lg overflow-hidden">
              <div className="p-4 bg-muted border-b flex justify-between items-center">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Chat</span>
                </h3>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 lg:hidden"
                  onClick={() => setShowChat(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="p-4 h-[400px]">
                {renderChat()}
              </div>
            </div>
          )}
        </div>
        
        {/* Status indicators for shared editing */}
        <div className="mt-6 flex flex-wrap gap-3">
          {collaborators
            .filter(user => user.active && user.id !== currentUser.id)
            .map(user => (
              <div
                key={user.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-muted"
              >
                <span 
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: colorFromUserName(user.name) }}
                ></span>
                <span>{user.name}</span>
                <span className="text-muted-foreground">
                  {user.cursor 
                    ? `at line ${user.cursor.line}` 
                    : 'viewing'}
                </span>
              </div>
            ))
          }
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-6">
        <div className="text-xs text-muted-foreground flex items-center">
          <Clock className="h-3.5 w-3.5 mr-1" />
          <span>Session started {getRelativeTime(session.createdAt)}</span>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyInviteLink}>
            <Link2 className="h-4 w-4 mr-2" />
            Share Link
          </Button>
          
          <Button 
            size="sm"
            disabled={!sessionActive}
            onClick={() => {
              toast({
                title: "Changes saved",
                description: "All participants now have the latest version.",
              });
            }}
          >
            <Save className="h-4 w-4 mr-2" />
            Save & Sync
          </Button>
        </div>
      </CardFooter>
      
      {/* Invite dialog */}
      {renderInviteDialog()}
    </Card>
  );
}

// Helper function to generate a consistent color from a username
function colorFromUserName(name: string): string {
  const colors = [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7',
    '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
    '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
    '#FFC107', '#FF9800', '#FF5722', '#795548',
  ];
  
  // Simple hash function to get a consistent index
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use hash to get a color
  const index = Math.abs(hash % colors.length);
  return colors[index];
}