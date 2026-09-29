import { ViewTransition } from "react";

/** Mismo nombre en la barra (home) y en el sidebar (internas): React los empareja y el nombre viaja. */
export default function MarkTransition({ children }: { children: React.ReactNode }) {
  return <ViewTransition name="site-mark">{children}</ViewTransition>;
}
