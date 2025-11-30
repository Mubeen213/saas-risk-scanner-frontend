import { useState, useEffect, useCallback } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  isLoading?: boolean;
  className?: string;
}

const SearchInput = ({
  value,
  onChange,
  placeholder = "Search...",
  debounceMs = 300,
  isLoading = false,
  className = "",
}: SearchInputProps) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const debouncedOnChange = useCallback(
    (newValue: string) => {
      const timeoutId = setTimeout(() => {
        onChange(newValue);
      }, debounceMs);
      return () => clearTimeout(timeoutId);
    },
    [onChange, debounceMs]
  );

  useEffect(() => {
    if (localValue !== value) {
      const cleanup = debouncedOnChange(localValue);
      return cleanup;
    }
  }, [localValue, value, debouncedOnChange]);

  const handleClear = () => {
    setLocalValue("");
    onChange("");
  };

  return (
    <div className={cn("relative", className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        ) : (
          <Search className="h-4 w-4 text-gray-400" />
        )}
      </div>
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "block w-full rounded-md border border-gray-200 bg-white py-2 pl-10 pr-10 text-sm",
          "placeholder:text-gray-400",
          "focus:border-brand-secondary focus:outline-none focus:ring-1 focus:ring-brand-secondary",
          "transition-colors"
        )}
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
