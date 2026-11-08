export function runOxfmt(
  oxfmtArgs: string[],
  cwd: string,
): Promise<{
  code: number
  stdout: string
  stderr: string
}>
