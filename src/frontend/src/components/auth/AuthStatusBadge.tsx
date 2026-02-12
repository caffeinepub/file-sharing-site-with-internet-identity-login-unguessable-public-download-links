import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '@/hooks/useQueries';
import { Badge } from '@/components/ui/badge';
import { User, UserCircle } from 'lucide-react';

export default function AuthStatusBadge() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading } = useGetCallerUserProfile();

  if (!identity) {
    return (
      <Badge variant="outline" className="gap-1.5">
        <UserCircle className="w-3.5 h-3.5" />
        Guest
      </Badge>
    );
  }

  if (isLoading) {
    return (
      <Badge variant="secondary" className="gap-1.5">
        <User className="w-3.5 h-3.5" />
        Loading...
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="gap-1.5">
      <User className="w-3.5 h-3.5" />
      {userProfile?.name || 'User'}
    </Badge>
  );
}
