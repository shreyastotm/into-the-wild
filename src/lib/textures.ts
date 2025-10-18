/**
 * Organic Texture Library
 * Collection of hand-drawn textures for nature-inspired UI
 */

// Paper Textures - Various paper types
export const paperTextures = {
  // Parchment - Aged paper texture
  parchment: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='parchment-noise'%3E%3CfeTurbulence baseFrequency='0.04' numOctaves='5' /%3E%3CfeColorMatrix values='0 0 0 0 0.9 0 0 0 0 0.8 0 0 0 0 0.7 0 0 0 0.1 0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23parchment-noise)' opacity='0.8'/%3E%3C/svg%3E")`,

  // Rice Paper - Delicate translucent texture
  ricePaper: `url("data:image/svg+xml,%3Csvg width='150' height='150' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='rice-noise'%3E%3CfeTurbulence baseFrequency='0.02' numOctaves='3' /%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.05 0'/%3E%3C/filter%3E%3Crect width='150' height='150' filter='url(%23rice-noise)' opacity='0.6'/%3E%3C/svg%3E")`,

  // Notebook Paper - Lined paper texture
  notebook: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20h100M0 40h100M0 60h100M0 80h100' stroke='%23000' stroke-width='0.5' opacity='0.1'/%3E%3Cfilter id='notebook-noise'%3E%3CfeTurbulence baseFrequency='0.01' numOctaves='2' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23notebook-noise)' opacity='0.3'/%3E%3C/svg%3E")`,

  // Kraft Paper - Brown craft paper texture
  kraft: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='kraft-noise'%3E%3CfeTurbulence baseFrequency='0.06' numOctaves='4' /%3E%3CfeColorMatrix values='0 0 0 0 0.8 0 0 0 0 0.6 0 0 0 0 0.4 0 0 0 0.15 0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23kraft-noise)' opacity='0.7'/%3E%3C/svg%3E")`,
};

// Wood Textures - Various wood grains
export const woodTextures = {
  // Pine Wood - Light pine grain
  pine: `url("data:image/svg+xml,%3Csvg width='300' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='pine-grain'%3E%3CfeTurbulence baseFrequency='0.02 0.8' numOctaves='3' /%3E%3CfeColorMatrix values='0 0 0 0 0.9 0 0 0 0 0.8 0 0 0 0 0.6 0 0 0 0.2 0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23pine-grain)' opacity='0.6'/%3E%3C/svg%3E")`,

  // Oak Wood - Dark oak grain
  oak: `url("data:image/svg+xml,%3Csvg width='250' height='250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='oak-grain'%3E%3CfeTurbulence baseFrequency='0.03 0.6' numOctaves='4' /%3E%3CfeColorMatrix values='0 0 0 0 0.4 0 0 0 0 0.3 0 0 0 0 0.2 0 0 0 0.3 0'/%3E%3C/filter%3E%3Crect width='250' height='250' filter='url(%23oak-grain)' opacity='0.8'/%3E%3C/svg%3E")`,

  // Birch Wood - Light birch with characteristic markings
  birch: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='birch-grain'%3E%3CfeTurbulence baseFrequency='0.01 0.4' numOctaves='2' /%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 0.9 0 0 0 0 0.8 0 0 0 0.1 0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23birch-grain)' opacity='0.4'/%3E%3C/svg%3E")`,

  // Driftwood - Weathered wood texture
  driftwood: `url("data:image/svg+xml,%3Csvg width='300' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='driftwood-grain'%3E%3CfeTurbulence baseFrequency='0.08 0.9' numOctaves='5' /%3E%3CfeColorMatrix values='0 0 0 0 0.7 0 0 0 0 0.6 0 0 0 0 0.5 0 0 0 0.4 0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23driftwood-grain)' opacity='0.9'/%3E%3C/svg%3E")`,
};

// Stone Textures - Various rock surfaces
export const stoneTextures = {
  // Granite - Speckled stone texture
  granite: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='granite-speckle'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='4' /%3E%3CfeColorMatrix values='0 0 0 0 0.3 0 0 0 0 0.3 0 0 0 0 0.3 0 0 0 0.2 0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23granite-speckle)' opacity='0.6'/%3E%3C/svg%3E")`,

  // Slate - Layered stone texture
  slate: `url("data:image/svg+xml,%3Csvg width='150' height='150' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='slate-layer'%3E%3CfeTurbulence baseFrequency='0.1 0.02' numOctaves='3' /%3E%3CfeColorMatrix values='0 0 0 0 0.2 0 0 0 0 0.2 0 0 0 0 0.3 0 0 0 0.4 0'/%3E%3C/filter%3E%3Crect width='150' height='150' filter='url(%23slate-layer)' opacity='0.7'/%3E%3C/svg%3E")`,

  // Pebble - Rounded stone texture
  pebble: `url("data:image/svg+xml,%3Csvg width='180' height='180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='pebble-texture'%3E%3CfeTurbulence baseFrequency='0.4' numOctaves='3' /%3E%3CfeColorMatrix values='0 0 0 0 0.6 0 0 0 0 0.5 0 0 0 0 0.4 0 0 0 0.3 0'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23pebble-texture)' opacity='0.5'/%3E%3C/svg%3E")`,

  // River Rock - Smooth water-worn stone
  riverRock: `url("data:image/svg+xml,%3Csvg width='220' height='220' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='river-rock'%3E%3CfeTurbulence baseFrequency='0.2 0.6' numOctaves='4' /%3E%3CfeColorMatrix values='0 0 0 0 0.8 0 0 0 0 0.7 0 0 0 0 0.6 0 0 0 0.2 0'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23river-rock)' opacity='0.4'/%3E%3C/svg%3E")`,
};

// Fabric Textures - Various cloth materials
export const fabricTextures = {
  // Canvas - Heavy cotton canvas
  canvas: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='canvas-weave'%3E%3CfeTurbulence baseFrequency='0.1 0.1' numOctaves='2' /%3E%3CfeColorMatrix values='0 0 0 0 0.9 0 0 0 0 0.9 0 0 0 0 0.9 0 0 0 0.15 0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23canvas-weave)' opacity='0.3'/%3E%3C/svg%3E")`,

  // Linen - Fine linen weave
  linen: `url("data:image/svg+xml,%3Csvg width='160' height='160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='linen-weave'%3E%3CfeTurbulence baseFrequency='0.05 0.05' numOctaves='2' /%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.08 0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23linen-weave)' opacity='0.2'/%3E%3C/svg%3E")`,

  // Burlap - Coarse jute fabric
  burlap: `url("data:image/svg+xml,%3Csvg width='180' height='180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='burlap-weave'%3E%3CfeTurbulence baseFrequency='0.15 0.15' numOctaves='3' /%3E%3CfeColorMatrix values='0 0 0 0 0.7 0 0 0 0 0.6 0 0 0 0 0.5 0 0 0 0.3 0'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23burlap-weave)' opacity='0.5'/%3E%3C/svg%3E")`,

  // Silk - Smooth silk texture
  silk: `url("data:image/svg+xml,%3Csvg width='240' height='240' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='silk-sheen'%3E%3CfeTurbulence baseFrequency='0.02 0.02' numOctaves='2' /%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.05 0'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23silk-sheen)' opacity='0.1'/%3E%3C/svg%3E")`,
};

// Leather Textures - Various leather types
export const leatherTextures = {
  // Cowhide - Classic leather texture
  cowhide: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='cowhide-texture'%3E%3CfeTurbulence baseFrequency='0.08 0.4' numOctaves='4' /%3E%3CfeColorMatrix values='0 0 0 0 0.6 0 0 0 0 0.4 0 0 0 0 0.3 0 0 0 0.4 0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23cowhide-texture)' opacity='0.7'/%3E%3C/svg%3E")`,

  // Pebbled Leather - Textured leather surface
  pebbled: `url("data:image/svg+xml,%3Csvg width='160' height='160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='pebbled-leather'%3E%3CfeTurbulence baseFrequency='0.3' numOctaves='3' /%3E%3CfeColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.4 0 0 0 0 0.3 0 0 0 0.5 0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23pebbled-leather)' opacity='0.6'/%3E%3C/svg%3E")`,

  // Distressed Leather - Worn leather texture
  distressed: `url("data:image/svg+xml,%3Csvg width='220' height='220' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='distressed-leather'%3E%3CfeTurbulence baseFrequency='0.12 0.6' numOctaves='5' /%3E%3CfeColorMatrix values='0 0 0 0 0.4 0 0 0 0 0.3 0 0 0 0 0.2 0 0 0 0.6 0'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23distressed-leather)' opacity='0.8'/%3E%3C/svg%3E")`,

  // Suede - Soft suede texture
  suede: `url("data:image/svg+xml,%3Csvg width='190' height='190' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='suede-texture'%3E%3CfeTurbulence baseFrequency='0.04 0.2' numOctaves='3' /%3E%3CfeColorMatrix values='0 0 0 0 0.8 0 0 0 0 0.7 0 0 0 0 0.6 0 0 0 0.2 0'/%3E%3C/filter%3E%3Crect width='190' height='190' filter='url(%23suede-texture)' opacity='0.4'/%3E%3C/svg%3E")`,
};

// Metal Textures - Various metal surfaces
export const metalTextures = {
  // Brushed Steel - Industrial metal texture
  brushedSteel: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='brushed-steel'%3E%3CfeTurbulence baseFrequency='0.02 0.8' numOctaves='3' /%3E%3CfeColorMatrix values='0 0 0 0 0.8 0 0 0 0 0.8 0 0 0 0 0.9 0 0 0 0.3 0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23brushed-steel)' opacity='0.6'/%3E%3C/svg%3E")`,

  // Copper - Warm metal texture
  copper: `url("data:image/svg+xml,%3Csvg width='180' height='180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='copper-texture'%3E%3CfeTurbulence baseFrequency='0.06 0.3' numOctaves='4' /%3E%3CfeColorMatrix values='0 0 0 0 0.9 0 0 0 0 0.5 0 0 0 0 0.2 0 0 0 0.4 0'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23copper-texture)' opacity='0.5'/%3E%3C/svg%3E")`,

  // Rusted Metal - Weathered metal texture
  rusted: `url("data:image/svg+xml,%3Csvg width='250' height='250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='rusted-metal'%3E%3CfeTurbulence baseFrequency='0.15 0.7' numOctaves='5' /%3E%3CfeColorMatrix values='0 0 0 0 0.7 0 0 0 0 0.3 0 0 0 0 0.1 0 0 0 0.6 0'/%3E%3C/filter%3E%3Crect width='250' height='250' filter='url(%23rusted-metal)' opacity='0.8'/%3E%3C/svg%3E")`,

  // Polished Chrome - Reflective metal texture
  chrome: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='chrome-texture'%3E%3CfeTurbulence baseFrequency='0.01 0.01' numOctaves='2' /%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.2 0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23chrome-texture)' opacity='0.3'/%3E%3C/svg%3E")`,
};

// Nature Textures - Organic environmental textures
export const natureTextures = {
  // Bark - Tree bark texture
  bark: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='bark-texture'%3E%3CfeTurbulence baseFrequency='0.2 0.8' numOctaves='4' /%3E%3CfeColorMatrix values='0 0 0 0 0.4 0 0 0 0 0.3 0 0 0 0 0.2 0 0 0 0.5 0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23bark-texture)' opacity='0.7'/%3E%3C/svg%3E")`,

  // Moss - Soft moss texture
  moss: `url("data:image/svg+xml,%3Csvg width='160' height='160' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='moss-texture'%3E%3CfeTurbulence baseFrequency='0.4' numOctaves='3' /%3E%3CfeColorMatrix values='0 0 0 0 0.2 0 0 0 0 0.6 0 0 0 0 0.1 0 0 0 0.4 0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23moss-texture)' opacity='0.5'/%3E%3C/svg%3E")`,

  // Sand - Beach sand texture
  sand: `url("data:image/svg+xml,%3Csvg width='180' height='180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='sand-texture'%3E%3CfeTurbulence baseFrequency='0.6' numOctaves='3' /%3E%3CfeColorMatrix values='0 0 0 0 0.9 0 0 0 0 0.8 0 0 0 0 0.6 0 0 0 0.2 0'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23sand-texture)' opacity='0.4'/%3E%3C/svg%3E")`,

  // Water - Rippling water texture
  water: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='water-ripple'%3E%3CfeTurbulence baseFrequency='0.02 0.8' numOctaves='3' /%3E%3CfeColorMatrix values='0 0 0 0 0.3 0 0 0 0 0.5 0 0 0 0 0.8 0 0 0 0.1 0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23water-ripple)' opacity='0.3'/%3E%3C/svg%3E")`,
};

// Utility functions for applying textures
export const textureUtils = {
  // Apply texture as background image
  applyTexture: (textureUrl: string, opacity: number = 0.1) => ({
    backgroundImage: textureUrl,
    backgroundRepeat: 'repeat',
    opacity,
  }),

  // Create texture overlay class
  textureOverlay: (textureUrl: string, opacity: number = 0.1) => ({
    backgroundImage: textureUrl,
    backgroundRepeat: 'repeat',
    position: 'absolute' as const,
    inset: 0,
    opacity,
    pointerEvents: 'none' as const,
  }),

  // Combine multiple textures
  combineTextures: (textures: string[], opacity: number = 0.1) => ({
    backgroundImage: textures.join(', '),
    backgroundRepeat: 'repeat',
    opacity,
  }),
};

// Pre-made texture combinations for common use cases
export const texturePresets = {
  // Journal page - parchment with subtle lines
  journal: textureUtils.combineTextures([paperTextures.parchment, paperTextures.notebook], 0.08),

  // Wooden sign - oak wood with grain
  woodenSign: textureUtils.applyTexture(woodTextures.oak, 0.15),

  // Leather book - distressed leather texture
  leatherBook: textureUtils.applyTexture(leatherTextures.distressed, 0.2),

  // Stone tablet - granite with slate layers
  stoneTablet: textureUtils.combineTextures([stoneTextures.granite, stoneTextures.slate], 0.12),

  // Canvas tent - canvas fabric texture
  canvasTent: textureUtils.applyTexture(fabricTextures.canvas, 0.1),

  // Nature background - moss and bark combined
  natureBackground: textureUtils.combineTextures([natureTextures.moss, natureTextures.bark], 0.08),
};

// Export all texture categories
export const textures = {
  paper: paperTextures,
  wood: woodTextures,
  stone: stoneTextures,
  fabric: fabricTextures,
  leather: leatherTextures,
  metal: metalTextures,
  nature: natureTextures,
  utils: textureUtils,
  presets: texturePresets,
};
