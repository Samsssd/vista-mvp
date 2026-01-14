// Local storage key for creations
const STORAGE_KEY = "vista-ia-creations";

// Creation status types
export const CreationStatus = {
  PENDING: "PENDING",
  UPLOADING: "UPLOADING",
  IN_QUEUE: "IN_QUEUE",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
};

// Get all creations from localStorage
export function getCreations() {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading creations:", error);
    return [];
  }
}

// Save creations to localStorage
export function saveCreations(creations) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(creations));
  } catch (error) {
    console.error("Error saving creations:", error);
  }
}

// Add a new creation
export function addCreation(creation) {
  const creations = getCreations();
  const newCreation = {
    id: `creation_${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: CreationStatus.PENDING,
    ...creation,
  };
  creations.unshift(newCreation);
  saveCreations(creations);
  return newCreation;
}

// Update a creation by ID
export function updateCreation(id, updates) {
  const creations = getCreations();
  const index = creations.findIndex((c) => c.id === id);
  if (index !== -1) {
    creations[index] = { ...creations[index], ...updates };
    saveCreations(creations);
    return creations[index];
  }
  return null;
}

// Get a single creation by ID
export function getCreation(id) {
  const creations = getCreations();
  return creations.find((c) => c.id === id) || null;
}

// Delete a creation by ID
export function deleteCreation(id) {
  const creations = getCreations();
  const filtered = creations.filter((c) => c.id !== id);
  saveCreations(filtered);
}

// Get pending/in-progress creations (for status checking)
export function getPendingCreations() {
  const creations = getCreations();
  return creations.filter(
    (c) =>
      c.status === CreationStatus.PENDING ||
      c.status === CreationStatus.UPLOADING ||
      c.status === CreationStatus.IN_QUEUE ||
      c.status === CreationStatus.IN_PROGRESS
  );
}
