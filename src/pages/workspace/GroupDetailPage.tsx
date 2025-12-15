import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users2 } from "lucide-react";
import Card from "@/components/ui/Card";
import { Badge, Button } from "@/components/ui";
import { DetailPageSkeleton, DetailPageError } from "@/components/workspace";
import { getWorkspaceGroupDetail } from "@/api/workspace";
import type { GroupDetail, GroupMember } from "@/types/workspace";

interface PageState {
  isLoading: boolean;
  error: string | null;
  data: GroupDetail | null;
}

const getRoleBadgeVariant = (role: string): "default" | "info" | "success" => {
  switch (role.toLowerCase()) {
    case "owner":
      return "success";
    case "manager":
      return "info";
    default:
      return "default";
  }
};

const GroupMemberRow = ({ member }: { member: GroupMember }) => {
  const displayName = member.full_name || member.email.split("@")[0];

  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-b-0">
      {member.avatar_url ? (
        <img
          src={member.avatar_url}
          alt={displayName}
          className="h-8 w-8 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white text-xs font-medium">
          {displayName[0].toUpperCase()}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-900 truncate">{displayName}</div>
        <div className="text-sm text-gray-500 truncate">{member.email}</div>
      </div>

      <Badge variant={getRoleBadgeVariant(member.role)} size="sm">
        {member.role}
      </Badge>
    </div>
  );
};

const GroupDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const groupId = id ? parseInt(id, 10) : null;

  const [state, setState] = useState<PageState>({
    isLoading: true,
    error: null,
    data: null,
  });

  const fetchGroupDetail = async (groupIdToFetch: number) => {
    setState({ isLoading: true, error: null, data: null });
    try {
      const response = await getWorkspaceGroupDetail(groupIdToFetch);
      if (response.error) {
        setState({
          isLoading: false,
          error: response.error.message,
          data: null,
        });
      } else {
        setState({ isLoading: false, error: null, data: response.data });
      }
    } catch {
      setState({
        isLoading: false,
        error: "Failed to load group details",
        data: null,
      });
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchGroupDetail(groupId);
    }
  }, [groupId]);

  if (state.isLoading) {
    return <DetailPageSkeleton />;
  }

  if (state.error) {
    return (
      <DetailPageError
        message={state.error}
        onRetry={() => groupId && fetchGroupDetail(groupId)}
        backPath="/groups"
        backLabel="Back to Groups"
      />
    );
  }

  const group = state.data;
  if (!group) return null;

  const membersByRole = group.members.reduce<Record<string, number>>(
    (acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      <Button 
        variant="ghost" 
        className="pl-0 gap-2 text-text-secondary hover:text-text-primary mb-4"
        onClick={() => navigate("/groups")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Groups
      </Button>

      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
          <Users2 className="h-8 w-8" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900">{group.name}</h1>
          <p className="text-gray-500">{group.email}</p>
        </div>
      </div>

      <Card padding="lg">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-500 mb-1">Total Members</div>
            <div className="font-medium text-gray-900">
              {group.direct_members_count}
            </div>
          </div>
          {Object.entries(membersByRole).map(([role, count]) => (
            <div key={role}>
              <div className="text-sm text-gray-500 mb-1 capitalize">
                {role}s
              </div>
              <div className="font-medium text-gray-900">{count}</div>
            </div>
          ))}
        </div>

        {group.description && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Description</div>
            <div className="text-gray-900">{group.description}</div>
          </div>
        )}
      </Card>

      <Card padding="lg">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Members ({group.members.length})
        </h2>
        {group.members.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            This group has no members
          </div>
        ) : (
          <div>
            {group.members.map((member) => (
              <GroupMemberRow key={member.user_id} member={member} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default GroupDetailPage;
