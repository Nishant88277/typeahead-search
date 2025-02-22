// components/Typeahead.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { debounce } from "lodash";
import { HighlightMatch } from "@/lib/highlight";

// Mock API function to fetch suggestions
const fetchSuggestions = async (query: string): Promise<string[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData = ["Apple", "Banana", "Cherry", "Date", "Elderberry", "Fig", "Grape"];
      const filteredData = query 
        ? mockData.filter((item) => item.toLowerCase().includes(query.toLowerCase()))
        : mockData; // Show all if query is empty

      resolve(filteredData);
    }, 300);
  });
};

export default function Typeahead() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = debounce(async (query: string) => {
    setIsLoading(true);
    const results = await fetchSuggestions(query);
    setSuggestions(results);
    setIsLoading(false);
    setIsDropdownOpen(results.length > 0); // Only open if there are results
  }, 300);

  useEffect(() => {
    debouncedSearch(query);
    return () => debouncedSearch.cancel();
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen) return; // Don't navigate if dropdown is closed

    if (e.key === "ArrowDown") {
      e.preventDefault(); // Prevent cursor from moving in input
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : suggestions.length > 0 ? 0 : -1)); // Loop back to top if at bottom, handle empty suggestions
    } else if (e.key === "ArrowUp") {
      e.preventDefault(); // Prevent cursor from moving in input
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1)); // Loop back to bottom if at top
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault(); // Prevent form submission
      setQuery(suggestions[activeIndex]);
      setIsDropdownOpen(false);
      setActiveIndex(-1); // Reset active index after selection
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
      setActiveIndex(-1); // Reset active index on escape
    }
  };

  const handleSelect = (item: string) => {
    setQuery(item);
    setIsDropdownOpen(false);
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setIsDropdownOpen(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (!isDropdownOpen) { // Open only if not already open
              setQuery(""); // Clear the input so all suggestions are shown
              debouncedSearch(""); // Trigger search with empty query
            }
          }}
          placeholder="Type to search..."
          className="w-full"
        />
        {query && ( // Only show clear button if there's a query
          <button
            onClick={handleClear}
            className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
          >
            ❌
          </button>
        )}
      </div>

      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg"
        >
          {isLoading ? (
            <div className="p-2 text-gray-500">Loading...</div>
          ) : (
            <ul className="py-1">
              {suggestions.length === 0 ? (
                <div className="p-2 text-gray-500">No results found.</div>
              ) : (
                suggestions.map((item, index) => (
                  <li
                    key={index}
                    onClick={() => handleSelect(item)}
                    className={`px-4 py-2 cursor-pointer ${
                      index === activeIndex ? "bg-gray-100" : ""
                    } hover:bg-gray-100`}
                  >
                    {HighlightMatch(item, query)}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}