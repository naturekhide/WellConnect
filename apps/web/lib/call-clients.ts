var clients: Map<string, any> = new Map();

export function getClient(userId: string) {
  return clients.get(userId);
}

export function setClient(userId: string | null, controller: any) {
  if (userId) clients.set(userId, controller);
}

export function removeClient(userId: string | null) {
  if (userId) clients.delete(userId);
}