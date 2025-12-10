import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AppWindow, AlertCircle, RefreshCw, ChevronRight } from "lucide-react";
import { Button, EmptyState, Badge } from "@/components/ui";
import { Pagination, SearchInput } from "@/components/ui";
import Table, { Column } from "@/components/ui/Table";
import { getDiscoveredApps } from "@/api/workspace";
import type { DiscoveredAppListItem, PaginationInfo } from "@/types/workspace";

interface ListState {
  items: DiscoveredAppListItem[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getClientTypeBadgeVariant = (
  clientType: string | null
): "default" | "info" | "success" => {
  if (!clientType) return "default";
  switch (clientType.toLowerCase()) {
    case "native":
      return "success";
    case "web":
      return "info";
    default:
      return "default";
  }
};

const AppsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [listState, setListState] = useState<ListState>({
    items: [],
    isLoading: true,
    error: null,
    pagination: null,
  });

  const fetchApps = useCallback(async () => {
    setListState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const params = { page, page_size: 20, search: search || undefined };
      const response = await getDiscoveredApps(params);
      if (response.error) {
        setListState({
          items: [],
          isLoading: false,
          error: response.error.message,
          pagination: null,
        });
      } else if (response.data) {
        setListState({
          items: response.data.items,
          isLoading: false,
          error: null,
          pagination: response.data.pagination,
        });
      }
    } catch {
      setListState({
        items: [],
        isLoading: false,
        error: "Failed to load apps",
        pagination: null,
      });
    }
  }, [page, search]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const columns: Column<DiscoveredAppListItem>[] = [
    {
      key: "display_name",
      header: "Application",
      render: (app) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-info-50 text-info-500 shrink-0">
            <AppWindow className="h-4 w-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-text-primary truncate">
              {app.display_name || "Unknown App"}
            </span>
            <span className="text-xs text-text-tertiary truncate max-w-[200px]">
              {app.client_id}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "client_type",
      header: "Type",
      render: (app) => (
        <Badge
          variant={getClientTypeBadgeVariant(app.client_type)}
          size="sm"
        >
          {app.client_type || "Unknown"}
        </Badge>
      ),
    },
    {
      key: "authorized_users_count",
      header: "Users",
      align: "center",
      render: (app) => (
        <span className="text-text-secondary">
          {app.authorized_users_count}
        </span>
      ),
    },
    {
      key: "first_seen_at",
      header: "First Seen",
      render: (app) => (
        <span className="text-text-secondary">
          {formatDate(app.first_seen_at)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "40px",
      render: () => (
        <ChevronRight className="h-4 w-4 text-text-tertiary" />
      ),
    },
  ];

  if (listState.error && listState.items.length === 0) {
    return (
      <div className="bg-background-primary rounded-xl p-8 shadow-sm border border-border-light">
        <EmptyState
          icon={<AlertCircle className="h-12 w-12 text-error-500" />}
          title="Failed to load apps"
          message={listState.error}
          action={
            <Button onClick={fetchApps} variant="secondary">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Apps</h1>
          <p className="mt-1 text-text-secondary">
            Third-party applications with access to your workspace
          </p>
        </div>
        <div className="w-full sm:w-72">
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Search apps..."
            isLoading={listState.isLoading}
          />
        </div>
      </div>

      {/* Apps Table */}
      <Table
        columns={columns}
        data={listState.items}
        isLoading={listState.isLoading}
        onRowClick={(app) => navigate(`/apps/${app.id}`)}
        emptyMessage="No apps discovered yet"
      />

      {listState.pagination && listState.pagination.total_pages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={listState.pagination.page}
            totalPages={listState.pagination.total_pages}
            onPageChange={handlePageChange}
            isLoading={listState.isLoading}
          />
        </div>
      )}
    </div>
  );
};

export default AppsPage;
