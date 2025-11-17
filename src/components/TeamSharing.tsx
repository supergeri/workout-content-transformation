import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Users, UserPlus, Mail, Share2, Copy, Check, Crown, Shield } from 'lucide-react';
import { WorkoutStructure } from '../types/workout';
import { toast } from 'sonner@2.0.3';

type Props = {
  user: {
    name: string;
    email: string;
    subscription: string;
  };
  currentWorkout: WorkoutStructure | null;
};

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  avatar?: string;
};

type SharedWorkout = {
  id: string;
  title: string;
  sharedBy: string;
  sharedDate: string;
  access: 'view' | 'edit';
};

// Mock data
const MOCK_TEAM_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Demo User', email: 'demo@amakaflow.com', role: 'owner' },
  { id: '2', name: 'Coach Mike', email: 'coach@example.com', role: 'admin' },
  { id: '3', name: 'Sarah Johnson', email: 'sarah@example.com', role: 'member' },
  { id: '4', name: 'Alex Chen', email: 'alex@example.com', role: 'member' },
];

const MOCK_SHARED_WORKOUTS: SharedWorkout[] = [
  { id: '1', title: 'Upper Body Strength', sharedBy: 'Coach Mike', sharedDate: '2025-11-07', access: 'edit' },
  { id: '2', title: 'HIIT Cardio Blast', sharedBy: 'Sarah Johnson', sharedDate: '2025-11-05', access: 'view' },
  { id: '3', title: 'Full Body Power', sharedBy: 'Coach Mike', sharedDate: '2025-11-03', access: 'edit' },
];

export function TeamSharing({ user, currentWorkout }: Props) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [teamMembers] = useState<TeamMember[]>(MOCK_TEAM_MEMBERS);
  const [sharedWorkouts] = useState<SharedWorkout[]>(MOCK_SHARED_WORKOUTS);

  const shareLink = currentWorkout 
    ? `https://amakaflow.com/share/${currentWorkout.title.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substr(2, 9)}`
    : '';

  const handleInvite = () => {
    if (!inviteEmail) return;
    toast.success(`Invitation sent to ${inviteEmail}`);
    setInviteEmail('');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success('Share link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-600" />;
      default:
        return <Users className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  if (user.subscription === 'free') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl mb-2">Team Sharing</h2>
          <p className="text-muted-foreground">
            Collaborate with coaches and teammates
          </p>
        </div>

        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
            <h3 className="text-xl mb-2">Upgrade to Pro or Team</h3>
            <p className="text-muted-foreground mb-6">
              Team sharing is available on Pro and Team plans
            </p>
            <div className="flex gap-3 justify-center">
              <Button>
                Upgrade to Pro
              </Button>
              <Button variant="outline">
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-2">Team Sharing</h2>
        <p className="text-muted-foreground">
          Collaborate with your team
        </p>
      </div>

      {/* Share Current Workout */}
      {currentWorkout && (
        <Card>
          <CardHeader>
            <CardTitle>Share Current Workout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm mb-2">Workout: <span className="font-medium">{currentWorkout.title}</span></p>
              <div className="flex gap-2">
                <Input
                  value={shareLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button onClick={handleCopyLink} className="gap-2">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Anyone with this link can view and import this workout
            </p>
          </CardContent>
        </Card>
      )}

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members ({teamMembers.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Invite Input */}
          <div className="flex gap-2">
            <Input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="teammate@example.com"
              type="email"
              onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
            />
            <Button onClick={handleInvite} className="gap-2">
              <UserPlus className="w-4 h-4" />
              Invite
            </Button>
          </div>

          {/* Members List */}
          <ScrollArea className="h-[300px]">
            <div className="space-y-2 pr-4">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{member.name}</p>
                      {getRoleIcon(member.role)}
                    </div>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                  <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Shared Workouts */}
      <Card>
        <CardHeader>
          <CardTitle>Shared with You ({sharedWorkouts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[250px]">
            <div className="space-y-2 pr-4">
              {sharedWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{workout.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Shared by {workout.sharedBy} • {new Date(workout.sharedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={workout.access === 'edit' ? 'default' : 'secondary'}>
                      {workout.access}
                    </Badge>
                    <Button size="sm" variant="outline">
                      Open
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Team Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Team Members</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{teamMembers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Shared Workouts</CardTitle>
            <Share2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{sharedWorkouts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pending Invites</CardTitle>
            <Mail className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">2</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}