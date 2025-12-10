import { useState, useEffect, useCallback } from "react";
import { Users, AlertCircle, RefreshCw } from "lucide-react";
import { Button, EmptyState } from "@/components/ui";
import { Pagination, SearchInput } from "@/components/ui";
import Table, { Column } from "@/components/ui/Table";
import { getWorkspaceUsers } from "@/api/workspace";
import type { WorkspaceUserListItem, PaginationInfo } from "@/types/workspace";

interface ListState {
  items: WorkspaceUserListItem[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginationInfo | null;
}

const UsersPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [listState, setListState] = useState<ListState>({
    items: [],
    isLoading: true,
    error: null,
    pagination: null,
  });

  const fetchUsers = useCallback(async () => {
    setListState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const params = { page, page_size: 20, search: search || undefined };
      const response = await getWorkspaceUsers(params);
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
        error: "Failed to load users",
        pagination: null,
      });
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const columns: Column<WorkspaceUserListItem>[] = [
    {
      key: "full_name",
      header: "User",
      render: (user) => (
        <div className="flex items-center gap-3">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.full_name || user.email}
              className="h-8 w-8 rounded-full object-cover border border-border-medium"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-secondary text-white text-xs font-medium shrink-0">
              {(user.full_name || user.email)[0].toUpperCase()}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-text-primary truncate">
              {user.full_name || user.email.split("@")[0]}
            </span>
            <span className="text-xs text-text-tertiary truncate">
              {user.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (user) => (
        <span className="text-text-secondary">{user.email}</span>
      ),
    },
    {
      key: "is_admin",
      header: "Role",
      render: (user) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
            user.is_admin
              ? "bg-brand-secondary/10 text-brand-secondary"
              : "bg-background-tertiary text-text-secondary"
          }`}
        >
          {user.is_admin ? "Admin" : "User"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (user) => {
        const isSuspended = user.status?.toLowerCase() === "suspended";
        return (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
              !isSuspended
                ? "bg-success-100 text-success-500"
                : "bg-error-100 text-error-500"
            }`}
          >
            {user.status || "Unknown"}
          </span>
        );
      },
    },
  ];

  if (listState.error && listState.items.length === 0) {
    return (
      <div className="bg-background-primary rounded-xl p-8 shadow-sm border border-border-light">
        <EmptyState
          icon={<AlertCircle className="h-12 w-12 text-error-500" />}
          title="Failed to load users"
          message={listState.error}
          action={
            <Button onClick={fetchUsers} variant="secondary">
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
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Users</h1>
          <p className="mt-1 text-text-secondary">
            All users in your Google Workspace
          </p>
        </div>
        <div className="w-full sm:w-72">
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Search users..."
            isLoading={listState.isLoading}
          />
        </div>
      </div>

      {/* Users Table */}
      <Table
        columns={columns}
        data={listState.items}
        isLoading={listState.isLoading}
        emptyMessage="No users found"
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

export default UsersPage;
