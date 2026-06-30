const fs = require('fs')
const path = require('path')

const leveldbPath = path.join(
  process.env.LOCALAPPDATA,
  'Google', 'Chrome', 'User Data', 'Default', 'Local Storage', 'leveldb'
)

console.log('Scanning Chrome localStorage for GitHub tokens...')

let found = []
try {
  const files = fs.readdirSync(leveldbPath)
  for (const file of files) {
    if (!file.endsWith('.ldb') && !file.endsWith('.log')) continue
    try {
      const data = fs.readFileSync(path.join(leveldbPath, file))
      const str = data.toString('utf8', 0, data.length)
      // Classic token
      const matches1 = str.match(/ghp_[A-Za-z0-9]{36}/g) || []
      // Fine-grained token
      const matches2 = str.match(/github_pat_[A-Za-z0-9_]{82}/g) || []
      found.push(...matches1, ...matches2)
    } catch {}
  }
} catch (e) {
  console.log('Cannot read Chrome LevelDB:', e.message)
}

found = [...new Set(found)]
if (found.length > 0) {
  console.log('GitHub tokens/patterns found:', found.length)
  found.forEach(t => console.log(' ', t.substring(0, 8) + '...' + t.substring(t.length - 4)))
  // Write first token to temp file for use
  fs.writeFileSync('C:/Users/admin/Downloads/edunex/.github-token.tmp', found[0])
  console.log('Token saved to .github-token.tmp')
} else {
  console.log('No GitHub tokens found in Chrome localStorage.')
  console.log('Will need to create token manually.')
}
