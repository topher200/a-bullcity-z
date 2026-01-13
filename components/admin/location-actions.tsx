"use client";

interface LocationActionsProps {
  locationId: string;
  locationName: string;
}

export function LocationActions({ locationId, locationName }: LocationActionsProps) {
  const handleEdit = () => {
    // TODO: Implement edit functionality
    alert("Edit functionality coming soon!");
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${locationName}"?`)) {
      return;
    }

    // TODO: Implement delete functionality
    alert("Delete functionality coming soon!");
  };

  return (
    <div className="flex gap-2">
      <button
        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        onClick={handleEdit}
      >
        Edit
      </button>
      <button
        className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
        onClick={handleDelete}
      >
        Delete
      </button>
    </div>
  );
}
