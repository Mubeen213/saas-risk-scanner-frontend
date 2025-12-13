import { useRef } from "react";
import { 
  Circle, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui";

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

// Icons mapping
const getEventIcon = (eventType: string) => {
  switch (eventType.toLowerCase()) {
    case "authorize":
    case "grant":
      return <CheckCircle2 className="h-5 w-5 text-success-500" />;
    case "revoke":
      return <XCircle className="h-5 w-5 text-error-500" />;
    case "risk_change":
      return <AlertTriangle className="h-5 w-5 text-warning-500" />;
    default:
      return <Circle className="h-5 w-5 text-info-500" />;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
};

interface TimelineProps {
  events: TimelineEvent[];
  isLoading?: boolean;
}

const Timeline = ({ events, isLoading }: TimelineProps) => {
  if (isLoading) {
    return <div className="text-center py-8 text-text-tertiary">Loading timeline...</div>;
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-text-tertiary bg-background-secondary rounded-lg border border-border-light border-dashed">
        <Clock className="h-12 w-12 mb-3 opacity-50" />
        <p>No activity recorded yet</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 border-l-2 border-border-light space-y-8">
      {events.map((event) => (
        <div key={event.id} className="relative">
          {/* Icon node */}
          <div className="absolute -left-[33px] top-0 bg-background-primary p-1 rounded-full border border-border-light ring-4 ring-background-primary">
            {getEventIcon(event.event_type)}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-text-primary capitalize">
                {event.event_type.replace(/_/g, " ")}
              </span>
              <span className="text-xs text-text-tertiary">
                {formatDate(event.event_time)}
              </span>
            </div>

            <p className="text-sm text-text-secondary">
              {event.actor_email ? (
                <>
                  Action by <span className="font-medium text-text-primary">{event.actor_name || event.actor_email}</span>
                </>
              ) : (
                "System Event"
              )}
            </p>
            
            {/* Optional details */}
            {event.raw_data && Object.keys(event.raw_data).length > 0 && (
                <div className="mt-2 text-xs bg-background-secondary p-2 rounded text-text-tertiary font-mono overflow-auto max-h-32">
                    {JSON.stringify(event.raw_data, null, 2)}
                </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
