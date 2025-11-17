import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { AlertTriangle, Zap, ArrowRight } from 'lucide-react';
import { User } from '../types/auth';

interface UsageLimitBannerProps {
  user: User;
  onUpgrade: () => void;
}

export function UsageLimitBanner({ user, onUpgrade }: UsageLimitBannerProps) {
  if (user.subscription !== 'free') {
    return null;
  }

  const isAtLimit = user.workoutsThisWeek >= 1;

  if (!isAtLimit && user.workoutsThisWeek === 0) {
    return null; // Don't show banner if they haven't used any yet
  }

  return (
    <Card className={`border-2 ${isAtLimit ? 'border-destructive bg-destructive/5' : 'border-primary bg-primary/5'}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={`flex-shrink-0 w-10 h-10 rounded-full ${isAtLimit ? 'bg-destructive/20' : 'bg-primary/20'} flex items-center justify-center`}>
            {isAtLimit ? (
              <AlertTriangle className="w-5 h-5 text-destructive" />
            ) : (
              <Zap className="w-5 h-5 text-primary" />
            )}
          </div>
          <div className="flex-1">
            {isAtLimit ? (
              <>
                <h3 className="font-semibold">Weekly Limit Reached</h3>
                <p className="text-sm text-muted-foreground">
                  You've used your 1 free workout this week. Upgrade to Pro for unlimited exports.
                </p>
              </>
            ) : (
              <>
                <h3 className="font-semibold">Free Tier Usage</h3>
                <p className="text-sm text-muted-foreground">
                  You've used {user.workoutsThisWeek} of 1 free workout this week. Upgrade for unlimited access.
                </p>
              </>
            )}
          </div>
          <Button onClick={onUpgrade} className="flex-shrink-0">
            Upgrade to Pro
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}