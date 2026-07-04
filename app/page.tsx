import Script from "next/script";
import { legacyDoorwayMarkup } from "../components/legacyMarkup";

export default function Page() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: legacyDoorwayMarkup }} />
      <Script src="/script.js" strategy="afterInteractive" />
      <Script src="/three-title.js" type="module" strategy="afterInteractive" />
    </>
  );
}
