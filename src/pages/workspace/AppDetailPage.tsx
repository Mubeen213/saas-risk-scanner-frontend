import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button, Badge, Card, Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui";
import Timeline from "@/components/workspace/Timeline";
import { getDiscoveredAppDetail, getAppTimeline } from "@/api/workspace";
import type { AppDetail } from "@/types/workspace";

const AppDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("overview");
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

    return (
        <div className="space-y-6">
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
                
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary mb-2">{app.name || "Unknown App"}</h1>
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-sm text-text-tertiary">{app.client_id}</span>
                            <Badge variant={app.status === "active" ? "success" : "default"}>
                                {app.status}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="p-6 col-span-2">
                            <h3 className="font-medium mb-4">Scopes & Permissions</h3>
                            <div className="flex flex-wrap gap-2">
                                {app.all_scopes.map(scope => (
                                    <Badge key={scope} variant="default" className="font-mono text-xs">
                                        {scope}
                                    </Badge>
                                ))}
                            </div>
                        </Card>
                        
                        <Card className="p-6">
                            <h3 className="font-medium mb-4">Risk Assessment</h3>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-success-50 rounded-lg text-success-600">
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-success-600">Safe</div>
                                    <div className="text-xs text-text-tertiary">Automated Score</div>
                                </div>
                            </div>
                            <div className="text-sm text-text-secondary">
                                No high-risk scopes detected. This app appears to be safe.
                            </div>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="timeline" className="mt-6">
                    <Card className="p-6">
                        <h3 className="font-medium mb-6">Activity History</h3>
                        <Timeline events={timeline} />
                    </Card>
                </TabsContent>
                
                <TabsContent value="users" className="mt-6">
                     <Card className="p-6">
                        <h3 className="font-medium mb-6">Authorized Users</h3>
                        <div className="space-y-4">
                            {app.authorizations.map(auth => (
                                <div key={auth.user_id} className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
                                    <div className="flex flex-col">
                                        <span className="text-text-primary font-medium">{auth.email}</span>
                                        <span className="text-xs text-text-tertiary">Granted: {new Date(auth.authorized_at).toLocaleDateString()}</span>
                                    </div>
                                    <Badge variant="default">{auth.status}</Badge>
                                </div>
                            ))}
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AppDetailPage;
