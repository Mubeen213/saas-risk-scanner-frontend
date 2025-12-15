import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button, Badge, Card } from "@/components/ui";
import Timeline from "@/components/workspace/Timeline";
import ScopesList from "@/components/workspace/ScopesList";
import { getDiscoveredAppDetail, getAppTimeline } from "@/api/workspace";
import type { AppDetail } from "@/types/workspace";

import { formatDisplayDate } from "@/utils/dateUtils";

const AppDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [app, setApp] = useState<AppDetail | null>(null);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDetails = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const [detailsRes, timelineRes] = await Promise.all([
                getDiscoveredAppDetail(parseInt(id)),
                getAppTimeline(parseInt(id), { page: 1, page_size: 20 })
            ]);

            if (detailsRes.data) {
                setApp(detailsRes.data);
            }
            if (timelineRes.data) {
                setTimeline(timelineRes.data.items);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    if (isLoading) return <div className="p-8">Loading...</div>;
    if (!app) return <div className="p-8">App not found</div>;

    // Helper to format grant date, handling 1970/null
    const formatGrantDate = (dateString: string) => {
        if (!dateString) return <span className="text-text-tertiary">-</span>;
        const date = new Date(dateString);
        if (date.getFullYear() <= 1970) return <span className="text-text-tertiary" title="Exact date unknown (legacy grant)">Unknown</span>;
        return formatDisplayDate(dateString);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <Button 
                    variant="ghost" 
                    className="pl-0 gap-2 text-text-secondary hover:text-text-primary mb-4"
                    onClick={() => navigate("/apps")}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Apps
                </Button>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary mb-2 flex items-center gap-3">
                            {app.name || "Unknown App"}
                            {app.is_system_app && <Badge variant="default" size="sm">System</Badge>}
                        </h1>
                        <div className="flex items-center gap-3 text-sm text-text-secondary">
                           <span className="font-mono">{app.client_id}</span>
                        </div>
                    </div>
                    {/* <div className="flex items-center gap-2">
                         <Badge variant={app.status === "active" ? "success" : "default"} size="lg">
                            {app.status}
                        </Badge>
                    </div> */}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Main Content (Left Col) */}
                <div className="space-y-8">
                    
                    {/* Data Access / Scopes */}
                    <section>
                        <h2 className="text-lg font-semibold text-text-primary mb-4">Data Access & Permissions</h2>
                        <Card className="p-6">
                            <ScopesList scopes={app.all_scopes} />
                        </Card>
                    </section>
                    
                    {/* Authorized Users */}
                    <section>
                        <h2 className="text-lg font-semibold text-text-primary mb-4">
                            Active Users ({app.active_grants_count})
                        </h2>
                        <Card className="overflow-hidden">
                            <div className="divide-y divide-border-light">
                                {app.authorizations.map(auth => (
                                    <div 
                                        key={auth.user_id} 
                                        className="flex items-center justify-between p-4 hover:bg-background-secondary/50 cursor-pointer transition-colors"
                                        onClick={() => navigate(`/users/${auth.user_id}`)}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        <div className="flex items-center gap-3">
                                            {auth.avatar_url ? (
                                                <img src={auth.avatar_url} className="h-8 w-8 rounded-full" />
                                            ) : (
                                                <div className="h-8 w-8 rounded-full bg-brand-secondary/10 flex items-center justify-center text-brand-secondary text-xs font-bold">
                                                    {(auth.full_name || auth.email)[0].toUpperCase()}
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span className="text-text-primary font-medium">{auth.full_name || auth.email}</span>
                                                <span className="text-xs text-text-tertiary">{auth.email}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs text-text-tertiary uppercase tracking-wider">Granted</span>
                                                <span className="text-sm text-text-secondary">{formatGrantDate(auth.authorized_at)}</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs text-text-tertiary uppercase tracking-wider">Scopes</span>
                                                <span className="text-sm text-text-secondary">{auth.scopes.length}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {app.authorizations.length === 0 && (
                                    <div className="p-8 text-center text-text-tertiary italic">
                                        No active users found.
                                    </div>
                                )}
                            </div>
                        </Card>
                    </section>

                    {/* App History (Timeline) - Moved to bottom */}
                    <section>
                         <h2 className="text-lg font-semibold text-text-primary mb-4">Risk Log & History</h2>
                         <Card className="p-6">
                             <Timeline events={timeline} />
                         </Card>
                    </section>
                </div>

                {/* Sidebar (Right Col) */}
                <div className="space-y-6">
                    {/* Risk Score Card */}
                     {/* <Card className="p-6 border-t-4 border-t-success-500">
                        <h3 className="font-medium text-text-secondary mb-4 uppercase tracking-wider text-xs">Risk Assessment</h3>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-success-50 rounded-full text-success-600">
                                <ShieldCheck className="h-8 w-8" />
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-success-600">Safe</div>
                                <div className="text-xs text-text-tertiary">Automated Score</div>
                            </div>
                        </div>
                        <div className="text-sm text-text-secondary leading-relaxed">
                            No high-risk behaviors detected. 
                            <br />
                            Risk Score: <span className="font-mono font-bold">{app.risk_score}</span>
                        </div>
                    </Card> */}

                    {/* Metadata Card (Future placeholder) */}
                    {/* <Card className="p-6">
                        <h3 className="font-medium text-text-secondary mb-4 uppercase tracking-wider text-xs">Metadata</h3>
                         <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-text-tertiary">First Seen</span>
                                <span className="text-text-secondary">-</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-text-tertiary">Last Activity</span>
                                <span className="text-text-secondary">
                                    {app.last_activity_at ? new Date(app.last_activity_at).toLocaleDateString() : "-"}
                                </span>
                            </div>
                        </div>
                    </Card> */}
                </div>
            </div>
        </div>
    );
};

export default AppDetailPage;
