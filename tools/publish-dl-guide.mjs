import { cpSync, existsSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const source = fileURLToPath(new URL('../dl-guide/site/dist/', import.meta.url))
const target = fileURLToPath(new URL('../public/dl-guide/', import.meta.url))
if (!existsSync(`${source}/index.html`)) {
  throw new Error('Build DL Guide first: npm --prefix dl-guide/site run build')
}
rmSync(target, { recursive: true, force: true })
cpSync(source, target, { recursive: true })
console.log('DL Guide published to public/dl-guide for the portfolio build.')
