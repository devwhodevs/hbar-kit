import type { Transport } from "./transport.js"

export interface PaginateOptions { maxPages?: number }

/** Async-iterate a list endpoint by following links.next verbatim until null. */
export async function* paginate<T>(
  transport: Transport,
  firstPath: string,
  select: (page: unknown) => T[],
  options: PaginateOptions = {},
): AsyncGenerator<T, void, unknown> {
  const maxPages = options.maxPages ?? 1000
  let path: string | null = firstPath
  let pages = 0
  while (path && pages < maxPages) {
    const page: unknown = await transport.get(path)
    for (const item of select(page)) yield item
    path = (page as { links?: { next: string | null } }).links?.next ?? null
    pages++
  }
}
