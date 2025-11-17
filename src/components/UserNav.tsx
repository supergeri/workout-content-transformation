import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Settings, 
  LogOut, 
  User as UserIcon,
  Crown,
  Zap,
  Star
} from 'lucide-react';
import { User } from '../types/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface UserNavProps {
  user: User;
  onOpenSettings: () => void;
  onLogout: () => void;
}

export function UserNav({ user, onOpenSettings, onLogout }: UserNavProps) {
  const getTierBadge = () => {
    switch (user.subscription) {
      case 'free':
        return (
          <Badge variant="secondary" className="ml-2">
            <Star className="w-3 h-3 mr-1" />
            Free ({user.workoutsThisWeek}/1)
          </Badge>
        );
      case 'pro':
        return (
          <Badge variant="default" className="ml-2">
            <Zap className="w-3 h-3 mr-1" />
            Pro
          </Badge>
        );
      case 'trainer':
        return (
          <Badge className="ml-2 bg-amber-500">
            <Crown className="w-3 h-3 mr-1" />
            Trainer
          </Badge>
        );
    }
  };

  const canExport = user.subscription !== 'free' || user.workoutsThisWeek < 1;

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">TQ</span>
          </div>
          <div>
            <h1 className="font-semibold">AmakaFlow</h1>
            <p className="text-xs text-muted-foreground">Workout Transformer</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center">
            {getTierBadge()}
            {!canExport && (
              <Badge variant="destructive" className="ml-2">
                Limit Reached
              </Badge>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-primary" />
                </div>
                <span className="hidden sm:inline">{user.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-muted-foreground font-normal">{user.email}</div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onOpenSettings}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}