import { useState, useEffect, useCallback } from "react";
import { AppWindow, AlertCircle, RefreshCw } from "lucide-react";
import { Button, Spinner, EmptyState } from "@/components/ui";
import { Pagination, SearchInput } from "@/components/ui";
import { DataList, AppListItem } from "@/components/workspace";
import { getDiscoveredApps } from "@/api/workspace";
import type { DiscoveredAppListItem, PaginationInfo } from "@/types/workspace";

interface ListState {
  items: DiscoveredAppListItem[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
}

const AppsPage = () => {
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

  if (listState.error && listState.items.length === 0) {
    return (
      <div className="bg-background-primary rounded-xl p-8">
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
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Apps</h1>
        <p className="mt-1 text-text-secondary">
          Third-party applications with access to your workspace
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder="Search apps..."
          isLoading={listState.isLoading}
        />
      </div>

      {/* Apps List */}
      <div className="bg-background-primary rounded-xl overflow-hidden">
        <DataList
          items={listState.items}
          isLoading={listState.isLoading}
          error={listState.error}
          emptyState={{
            title: "No apps discovered yet",
            description:
              "Third-party apps will appear here after your first sync completes.",
            icon: <AppWindow className="h-12 w-12 text-text-tertiary" />,
          }}
          skeletonVariant="app"
          skeletonCount={10}
          renderItem={(item) => <AppListItem key={item.id} app={item} />}
          onRetry={fetchApps}
        />

        {listState.pagination && listState.pagination.total_pages > 1 && (
          <div className="px-4 py-3 border-t border-border-light">
            <Pagination
              currentPage={listState.pagination.page}
              totalPages={listState.pagination.total_pages}
              onPageChange={handlePageChange}
              isLoading={listState.isLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AppsPage;
