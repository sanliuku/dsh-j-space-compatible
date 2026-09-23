import { cp, mkdir, rm, stat } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const DSH_HOME_DIR_NAME = '.dsh'
export const DSH_HOME_ENV = 'DSH_HOME'
export const USER_PRESET_DIR = '.agent-presets'
export const PRESET_ID = 'j-space'

export function expandHomePath(path) {
  if (path === '~') return homedir()
  if (path.startsWith('~/') || path.startsWith('~\\')) return join(homedir(), path.slice(2))
  return path
}

export function resolveDshHome(configured, env = process.env) {
  const fromEnv = env[DSH_HOME_ENV]
  const selected = configured ?? (fromEnv !== undefined && fromEnv.trim().length > 0 ? fromEnv : join(homedir(), DSH_HOME_DIR_NAME))
  return resolve(expandHomePath(selected))
}

export function dshHomePath(...segments) { return join(resolveDshHome(), ...segments) }
export function getJSpaceTemplatePath() { return fileURLToPath(new URL('../preset/', import.meta.url)) }
export function targetUserPresetDir(dshHome) {
  return dshHome !== undefined && dshHome !== ''
    ? join(resolveDshHome(dshHome), USER_PRESET_DIR, PRESET_ID)
    : join(dshHomePath(USER_PRESET_DIR), PRESET_ID)
}

export async function isJSpacePresetInstalled(targetDir) {
  try { return (await stat(join(targetDir ?? targetUserPresetDir(), 'agent.cordis.yml'))).isFile() } catch { return false }
}

export async function installJSpacePreset(options = {}) {
  const targetDir = targetUserPresetDir(options.dshHome)
  await mkdir(dirname(targetDir), { recursive: true })
  await cp(getJSpaceTemplatePath(), targetDir, { recursive: true, force: options.force ?? true })
  return targetDir
}

export async function uninstallJSpacePreset(dshHome) {
  const targetDir = targetUserPresetDir(dshHome)
  try {
    const entry = await stat(targetDir)
    if (entry.isDirectory() || entry.isFile()) { await rm(targetDir, { recursive: true, force: true }); return true }
    return false
  } catch { return false }
}

export async function verifyJSpacePreset(presetPath) {
  const dir = presetPath ?? targetUserPresetDir()
  const files = ['preset.yml', 'agent.cordis.yml', 'skills/j-space/SKILL.md', 'skills/j-space/scripts/control.py', 'skills/j-space/scripts/host_bridge.py', 'skills/j-space/scripts/jspace.py', 'skills/j-space/scripts/verify_suite.py']
  for (const relative of files) {
    try {
      if (!(await stat(join(dir, relative))).isFile()) return { ok: false, presetPath: dir, message: `Expected regular file at: ${relative}` }
    } catch { return { ok: false, presetPath: dir, message: `Missing required file: ${relative}` } }
  }
  return { ok: true, presetPath: dir }
}
