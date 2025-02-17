/**
 * @typedef {{
 *  vue: () => boolean;
 *  template: () => boolean;
 *  script: (extensions?: string | string[]) => boolean;
 *  style: (extensions?: string | string[]) => boolean;
 * }} ViteQueryIs
 */

/**
 * @see https://github.com/vitejs/vite/blob/364aae13f0826169e8b1c5db41ac6b5bb2756958/packages/plugin-vue/src/utils/query.ts - source of inspiration
 * @example
 * '/absolute/path/src/App.vue' // Can contain combined template&script -> template: true, script: true, style: false
 * '/absolute/path/src/App.vue?vue&type=script&lang.js' // Only contains script -> template: false, script: true, style: false
 * '/absolute/path/src/App.vue?vue&type=style&lang.sass' // Only contains style -> template: false, script: false, style: true
 * '/absolute/path/src/script.js' // Only contains script -> template: false, script: true, style: false
 * '/absolute/path/src/index.scss' // Only contains style -> template: false, script: false, style: true
 *
 * @param {string} id
 * @returns {{ filename: string; query: { [key: string]: string; }; is: ViteQueryIs }}
 */
export function parseViteRequest (id) {
  const [ filename, rawQuery ] = id.split('?', 2)
  const query = Object.fromEntries(new URLSearchParams(rawQuery))

  const is = query.vue !== void 0 // is vue query?
    ? {
        vue: () => true,
        template: () => query.type === void 0 || query.type === 'template',
        script: (extensions = scriptExt) =>
          (query.type === void 0 || query.type === 'script') &&
          isOfExt({ query, extensions }) === true,
        style: (extensions = styleExt) =>
          query.type === 'style' && isOfExt({ query, extensions }) === true
      }
    : {
        vue: () => isOfExt({ extensions: vueExt, filename }),
        template: () => isOfExt({ filename, extensions: vueExt }),
        script: (extensions = scriptExt) => isOfExt({ filename, extensions }),
        style: (extensions = styleExt) => isOfExt({ filename, extensions })
      }

  return {
    filename,
    query,
    is
  }
}

const vueExt = [ '.vue' ]
const scriptExt = [ '.js', '.jsx', '.ts', '.tsx', '.vue' ]
const styleExt = [ '.css', '.scss', '.sass' ]

const isOfExt = ({ extensions, filename, query }) =>
  extensions.some(
    ext => filename?.endsWith(ext) || query?.[`lang${ext}`] !== void 0
  )
