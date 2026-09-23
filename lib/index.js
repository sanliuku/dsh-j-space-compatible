import { installJSpacePreset, isJSpacePresetInstalled } from './installer.js'

export { getJSpaceTemplatePath, installJSpacePreset, isJSpacePresetInstalled, PRESET_ID, targetUserPresetDir, uninstallJSpacePreset, USER_PRESET_DIR, verifyJSpacePreset } from './installer.js'

export const name = 'plugin-j-space'

export function apply(ctx, config = {}) {
  if (!(config.autoDeploy ?? true)) return
  ctx.on('ready', async () => {
    try {
      if (!(await isJSpacePresetInstalled())) {
        await installJSpacePreset()
        ctx.logger.info('J-Space Cognition Suite SV1 preset deployed to DSH user presets directory.')
      }
    } catch (error) {
      ctx.logger.warn(`Failed to auto-deploy J-Space preset: ${String(error)}`)
    }
  })
}

export default { name, apply }
