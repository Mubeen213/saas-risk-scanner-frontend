import { useState, useEffect, useCallback } from "react";
import { Users2, AlertCircle, RefreshCw } from "lucide-react";
import { Button, EmptyState } from "@/components/ui";
import { Pagination, SearchInput } from "@/components/ui";
import Table, { Column } from "@/components/ui/Table";
import { getWorkspaceGroups } from "@/api/workspace";
import type { WorkspaceGroupListItem, PaginationInfo } from "@/types/workspace";

interface ListState {
  items: WorkspaceGroupListItem[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
}

const GroupsPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [listState, setListState] = useState<ListState>({
    items: [],
    isLoading: true,
    error: null,
    pagination: null,
  });

  const fetchGroups = useCallback(async () => {
    setListState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const params = { page, page_size: 20, search: search || undefined };
      const response = await getWorkspaceGroups(params);
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
        error: "Failed to load groups",
        pagination: null,
      });
    }
  }, [page, search]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const columns: Column<WorkspaceGroupListItem>[] = [
    {
      key: "name",
      header: "Group",
      render: (group) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-secondary/10 text-brand-secondary shrink-0">
            <Users2 className="h-4 w-4" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-text-primary truncate">
              {group.name}
            </span>
            <span className="text-xs text-text-tertiary truncate">
              {group.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (group) => (
        <span className="text-text-secondary">{group.email}</span>
      ),
    },
    {
      key: "direct_members_count",
      header: "Members",
      align: "center",
      render: (group) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-background-tertiary text-text-secondary">
          {group.direct_members_count || 0}
        </span>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (group) => (
        <span className="text-text-tertiary truncate max-w-[300px] block">
          {group.description || "-"}
        </span>
      ),
    },
  ];

  if (listState.error && listState.items.length === 0) {
    return (
      <div className="bg-background-primary rounded-xl p-8 shadow-sm border border-border-light">
        <EmptyState
          icon={<AlertCircle className="h-12 w-12 text-error-500" />}
          title="Failed to load groups"
          message={listState.error}
          action={
            <Button onClick={fetchGroups} variant="secondary">
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
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Groups</h1>
          <p className="mt-1 text-text-secondary">
            All groups in your Google Workspace
          </p>
        </div>
        <div className="w-full sm:w-72">
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Search groups..."
            isLoading={listState.isLoading}
          />
        </div>
      </div>

      {/* Groups Table */}
      <Table
        columns={columns}
        data={listState.items}
        isLoading={listState.isLoading}
        emptyMessage="No groups found"
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

export default GroupsPage;
