"use client";

import * as React from "react";
import { Check, ChevronsUpDown, ListTodo } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Category from "interfaces/category";
import { useQuery } from "@tanstack/react-query";

interface CategoryProps {
  categoryToSend: Category | null;
  setCategory: (value: Category) => void;
}

export function DropDownCategory({ categoryToSend, setCategory }: CategoryProps) {
  const [open, setOpen] = React.useState(false);
  
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch("/api/category", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Error fetching category");
      }
      return response.json();
    }
  });

  // selected value as id string
  const value = categoryToSend ? String(categoryToSend.id) : "";

  const handleSelect = (currentValue: string) => {
    const selected = categories.find((c) => String(c.id) === currentValue);
    if (selected) setCategory(selected);
    setOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-md" />
        <Skeleton className="h-4 w-[100px]" />
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-controls="category-list"
          aria-expanded={open}
          className="w-fit px-2 h-7 text-xs justify-start font-medium dark:bg-[#111111] shadow-none overflow-hidden"
        >
          <ListTodo className="h-4 w-4 text-muted-foreground" />
          {value
            ? categories.find((cat) => String(cat.id) === value)?.name
            : "Project"}
          <ChevronsUpDown className="ml-auto h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search project..." className="h-9" />
          <CommandList>
            <CommandEmpty>No project found.</CommandEmpty>
            <CommandGroup>
              {categories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={String(category.id)}
                  onSelect={handleSelect}
                >
                  {category.icon && (
                    <span
                      className="p-1 rounded-md text-xs mr-2"
                      style={{
                        backgroundColor: category.color,
                      }}
                    >
                      {category.icon}
                    </span>
                  )}
                  {category.name}
                  <Check
                    className={cn(
                      "ml-auto",
                      value === String(category.id)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
