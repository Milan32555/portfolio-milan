export const GATE_SEEN_KEY = "gateSeen";

/**
 * Corre dentro del HTML del home, antes del primer paint (ver PrePaintScript.tsx):
 * - data-landing="home": la visita llegó al home con una carga completa (el muro puede mostrarse).
 * - data-gate="skip": el muro ya se vio en esta sesión → CSS lo oculta sin parpadeo.
 * - data-hero3d="on" | "off": si se espera la escena 3D, CSS oculta el <h1> de texto para
 *   que no aparezca "Misael." en blanco y luego el código (misma regla que hero3dAllowed).
 * Debe ser ES5 plano y a prueba de errores: nunca puede romper la carga de la página.
 */
export const PRE_PAINT_SCRIPT =
  "(function(){try{var h=document.documentElement;h.setAttribute('data-landing','home');" +
  `var seen=false;try{seen=sessionStorage.getItem('${GATE_SEEN_KEY}')==='1'}catch(e){}` +
  "if(seen)h.setAttribute('data-gate','skip');" +
  "var gl=!!window.WebGLRenderingContext;var cores=navigator.hardwareConcurrency||4;" +
  "h.setAttribute('data-hero3d',gl&&cores>2?'on':'off')}catch(e){}})();";
