export function resolveConfig(
  args?: Record<string, any>,
  cwd?: string,
): Promise<{
  file: string
  temp: boolean
}>
