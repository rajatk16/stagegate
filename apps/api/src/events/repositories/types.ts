export type EventListOptions = {
  limit: number;
  cursor?: string;
};

export type EventListResult<T> = {
  items: T[];
  nextCursor?: string;
};
