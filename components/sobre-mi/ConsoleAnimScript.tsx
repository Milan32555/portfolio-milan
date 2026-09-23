const CONSOLE_ANIM_SCRIPT =
  "(function(){try{var h=document.documentElement;var r=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;if(!r)h.setAttribute('data-console-anim','on')}catch(e){}})();";

/**
 * Script inline que corre durante el parseo del HTML, antes del primer paint (mismo
 * mecanismo que components/home/PrePaintScript.tsx): si no hay movimiento reducido,
 * marca <html data-console-anim="on"> para que el CSS oculte el cuerpo de la consola
 * hasta que React la vacíe e hidrate (ver KaliConsole.tsx), evitando el parpadeo de
 * "consola completa → vacía → escribiéndose" en la primera carga.
 */
export default function ConsoleAnimScript() {
  return <script dangerouslySetInnerHTML={{ __html: CONSOLE_ANIM_SCRIPT }} />;
}
