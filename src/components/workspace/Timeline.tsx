import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Circle,
  ShieldAlert,
  ShieldCheck,
  User
} from "lucide-react";

import { formatDisplayDateTime } from "@/utils/dateUtils";

// Define event types based on backend OAuthEvent enum/strings
interface TimelineEvent {
  id: number;
  event_type: string;
  event_time: string;
  actor_email?: string | null;
  actor_name?: string | null;
  actor_avatar_url?: string | null;
  raw_data: Record<string, any>;
}

const getEventConfig = (eventType: string) => {
  switch (eventType.toLowerCase()) {
    case "authorize":
    case "grant":
      return {
        icon: ShieldCheck,
        color: "text-success-600",
        bg: "bg-success-50",
        label: "Access Granted"
      };
    case "revoke":
      return {
        icon: XCircle,
        color: "text-text-secondary",
        bg: "bg-background-tertiary",
        label: "Access Revoked"
      };
    case "risk_change":
      return {
        icon: AlertTriangle,
        color: "text-warning-600",
        bg: "bg-warning-50",
        label: "Risk Score Changed"
      };
    case "suspicious_activity":
      return {
        icon: ShieldAlert,
        color: "text-error-600",
        bg: "bg-error-50",
        label: "Suspicious Activity"
      };
    default:
      return {
        icon: Circle,
        color: "text-info-600",
        bg: "bg-info-50",
        label: eventType.replace(/_/g, " ")
      };
  }
};


interface TimelineProps {
  events: TimelineEvent[];
  isLoading?: boolean;
}

const Timeline = ({ events, isLoading }: TimelineProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <div className="h-2 w-12 bg-gray-200 rounded"></div>
            <div className="h-2 w-full bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="py-8 text-sm text-text-tertiary italic">
        No activity recorded.
      </div>
    );
  }

  return (
    <div className="relative space-y-6 before:absolute before:inset-0 before:ml-[19px] before:h-full before:w-0.5 before:-translate-x-1/2 before:bg-gradient-to-b before:from-border-light before:via-border-light before:to-transparent">
      {events.map((event) => {
        const config = getEventConfig(event.event_type);
        const Icon = config.icon;
        
        return (
          <div key={event.id} className="relative flex gap-4 group">
            {/* Timeline Node */}
            <div className={`absolute left-0 mt-1.5 h-2.5 w-2.5 rounded-full border-2 border-background-primary ring-4 ring-background-primary ${config.color.replace('text', 'bg')} z-10`} />
            
            <div className="flex-1 pl-8">
              {/* Header Row */}
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-sm font-semibold ${config.color}`}>
                  {config.label}
                </span>
                <span className="text-xs text-text-tertiary">
                  • {formatDisplayDateTime(event.event_time)}
                </span>
              </div>

              {/* Actor */}
              <div className="flex items-center gap-2 mb-2">
                {event.actor_avatar_url ? (
                  <img src={event.actor_avatar_url} className="h-4 w-4 rounded-full" />
                ) : (
                  <User className="h-3 w-3 text-text-tertiary" />
                )}
                <span className="text-sm text-text-secondary">
                  {event.actor_name || event.actor_email || "System"}
                </span>
              </div>

              {/* Details (Notion-style toggle block appearance) */}
              {event.raw_data && Object.keys(event.raw_data).length > 0 && (
                <div className="text-xs font-mono text-text-tertiary bg-background-tertiary/50 p-2 rounded border border-transparent group-hover:border-border-light transition-colors">
                  {JSON.stringify(event.raw_data)}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
