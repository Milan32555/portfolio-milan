import { PRE_PAINT_SCRIPT } from "@/lib/prePaint";

/** Script inline que corre durante el parseo del HTML, antes del primer paint (ver lib/prePaint.ts). */
export default function PrePaintScript() {
  return <script dangerouslySetInnerHTML={{ __html: PRE_PAINT_SCRIPT }} />;
}
