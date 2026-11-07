// fake oxfmt cli for testing @magic/format
// behavior is driven by FAKE_OXFMt_SCENARIO, e.g. "check=list,write=error"

const behaviors = {}
for (const pair of (process.env.FAKE_OXFMt_SCENARIO || '').split(',')) {
  const [mode, behavior] = pair.split('=')
  if (mode) {
    behaviors[mode] = behavior
  }
}

const mode = process.argv.includes('--write') ? 'write' : 'check'
const behavior = behaviors[mode] || 'clean'

switch (behavior) {
  case 'list':
    process.stdout.write('a.js\nb.js\n')
    process.exit(1)
    break
  case 'list-err':
    process.stdout.write('a.js\n')
    process.stderr.write('note: something happened\n')
    process.exit(1)
    break
  case 'error':
    process.stderr.write('Expected `}` but found `EOF`\n')
    process.exit(2)
    break
  case 'crash':
    process.stderr.write('boom: exploded\n')
    process.exit(1)
    break
  case 'write-warn':
    process.stderr.write('note: wrote with a note\n')
    process.exit(0)
    break
  case 'write-crash':
    process.stderr.write('boom: write exploded\n')
    process.exit(3)
    break
  default:
    process.exit(0)
}
