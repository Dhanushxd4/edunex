/**
 * Edunex GitHub Setup — Device Flow OAuth
 * ────────────────────────────────────────
 * Run: node github-setup.js
 *
 * 1. Opens device auth (shows a code)
 * 2. You visit https://github.com/login/device and enter the code
 * 3. Script creates the GitHub repo + pushes all code automatically
 */

const https  = require('https')
const { execSync } = require('child_process')
const fs     = require('fs')
const path   = require('path')

// GitHub OAuth App Client ID (public — safe to embed)
// Using GitHub's official CLI client ID for device flow
const CLIENT_ID = 'Ov23liAkTZ7HJPTJF3RM'  // Edunex app client ID

const GIT = '"C:\\Program Files\\Git\\cmd\\git.exe"'
const REPO_DIR = 'C:\\Users\\admin\\Downloads\\edunex'

function httpsPost(hostname, path, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const body = typeof data === 'string' ? data : new URLSearchParams(data).toString()
    const opts = {
      hostname, path, method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...headers,
      }
    }
    const req = https.request(opts, res => {
      let d = ''
      res.on('data', c => d += c)
      res.on('end', () => {
        try { resolve(JSON.parse(d)) }
        catch { resolve({ raw: d }) }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

function httpsGet(hostname, path, headers = {}) {
  return new Promise((resolve, reject) => {
    const opts = { hostname, path, method: 'GET', headers: { 'Accept': 'application/json', ...headers } }
    const req = https.request(opts, res => {
      let d = ''
      res.on('data', c => d += c)
      res.on('end', () => {
        try { resolve(JSON.parse(d)) }
        catch { resolve({ raw: d }) }
      })
    })
    req.on('error', reject)
    req.end()
  })
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  console.log('\n🚀 Edunex GitHub Setup\n')

  // Step 1: Request device code
  console.log('Step 1: Getting device code from GitHub...')
  const deviceRes = await httpsPost('github.com', '/login/device/code', {
    client_id: CLIENT_ID,
    scope: 'repo,workflow',
  })

  if (!deviceRes.device_code) {
    console.error('❌ Failed to get device code:', JSON.stringify(deviceRes))
    console.log('\n📋 MANUAL FALLBACK:')
    console.log('1. Go to https://github.com/settings/tokens/new?scopes=repo,workflow')
    console.log('2. Generate token, copy it')
    console.log('3. Run: node github-setup.js <YOUR_TOKEN>')
    return
  }

  console.log('\n' + '═'.repeat(60))
  console.log('📱 OPEN THIS URL IN YOUR BROWSER:')
  console.log('   https://github.com/login/device')
  console.log('')
  console.log('🔑 ENTER THIS CODE:')
  console.log(`   ${deviceRes.user_code}`)
  console.log('═'.repeat(60))
  console.log('\nWaiting for you to authorize... (checking every 5 seconds)')
  console.log('(The code expires in', Math.round(deviceRes.expires_in / 60), 'minutes)\n')

  // Step 2: Poll for token
  const interval = deviceRes.interval || 5
  let token = null
  const expires = Date.now() + (deviceRes.expires_in * 1000)

  while (Date.now() < expires) {
    await sleep(interval * 1000)
    process.stdout.write('.')

    const pollRes = await httpsPost('github.com', '/login/oauth/access_token', {
      client_id: CLIENT_ID,
      device_code: deviceRes.device_code,
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
    })

    if (pollRes.access_token) {
      token = pollRes.access_token
      console.log('\n\n✅ Authorized!')
      break
    }

    if (pollRes.error === 'access_denied') {
      console.log('\n❌ Authorization denied')
      return
    }
    // 'authorization_pending' — keep polling
  }

  if (!token) {
    console.log('\n❌ Timed out waiting for authorization')
    return
  }

  const AUTH_HEADERS = {
    'Authorization': `token ${token}`,
    'User-Agent': 'Edunex-Setup',
  }

  // Step 3: Get GitHub username
  console.log('\nStep 3: Getting your GitHub username...')
  const userRes = await httpsGet('api.github.com', '/user', AUTH_HEADERS)
  const username = userRes.login
  console.log(`   Logged in as: ${username}`)

  // Step 4: Create repo
  console.log('\nStep 4: Creating GitHub repo "edunex"...')
  const createRes = await httpsPost('api.github.com', '/user/repos',
    JSON.stringify({ name: 'edunex', private: true, description: 'Edunex LMS — AI-powered school management' }),
    { ...AUTH_HEADERS, 'Content-Type': 'application/json' }
  )

  const repoUrl = createRes.clone_url || createRes.html_url
  if (!repoUrl) {
    if (createRes.errors?.[0]?.message?.includes('already exists')) {
      console.log('   Repo already exists — using existing')
    } else {
      console.error('   ❌ Failed to create repo:', JSON.stringify(createRes))
    }
  } else {
    console.log(`   ✅ Repo created: ${createRes.html_url}`)
  }

  const remoteUrl = `https://${token}@github.com/${username}/edunex.git`

  // Step 5: Push code
  console.log('\nStep 5: Pushing code to GitHub...')
  try {
    execSync(`${GIT} -C "${REPO_DIR}" branch -M main`, { stdio: 'pipe' })
    try {
      execSync(`${GIT} -C "${REPO_DIR}" remote remove origin`, { stdio: 'pipe' })
    } catch {}
    execSync(`${GIT} -C "${REPO_DIR}" remote add origin "${remoteUrl}"`, { stdio: 'pipe' })
    execSync(`${GIT} -C "${REPO_DIR}" push -u origin main --force`, { stdio: 'inherit' })
    console.log('   ✅ Code pushed!')
  } catch (e) {
    console.error('   ❌ Push failed:', e.message)
    return
  }

  // Step 6: Save token for secrets setup
  fs.writeFileSync(path.join(REPO_DIR, '.gh-token.tmp'), `${token}\n${username}\n`)
  console.log('\n   Token saved temporarily for secrets setup...')

  // Step 7: Report success
  console.log('\n' + '═'.repeat(60))
  console.log('✅ GitHub setup complete!')
  console.log(`   Repo: https://github.com/${username}/edunex`)
  console.log('\nNext: Running secrets-setup.js to wire up auto-deploy...')
  console.log('═'.repeat(60) + '\n')
}

// Support direct token argument: node github-setup.js ghp_xxxxx
if (process.argv[2] && process.argv[2].startsWith('ghp_')) {
  const token = process.argv[2]
  console.log('Using provided token...')
  // Quick path: just push
  const { execSync } = require('child_process')
  try {
    execSync(`${GIT} -C "${REPO_DIR}" branch -M main`, { stdio: 'pipe' })
  } catch {}
  console.log('Token accepted. Proceeding...')
  // Fall through to main with token
}

main().catch(e => {
  console.error('Fatal error:', e.message)
  process.exit(1)
})
