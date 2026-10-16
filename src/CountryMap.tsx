import { lazy, memo, Suspense } from "react";

const OfflineCountryMap = lazy(() => import("./OfflineCountryMap"));

export default memo(function CountryMap({ country, isFixedMap, mapMode, hardMode }: {
  country: { lat: number; lng: number; zoom: number };
  isFixedMap: boolean; mapMode: "map" | "satellite"; hardMode: boolean;
}) {
  const zoom = isFixedMap ? 2 : Math.min(country.zoom + 1, 10);
  const source = `https://maps.google.com/maps?q=${country.lat},${country.lng}&z=${zoom}&t=${mapMode === "satellite" ? "k" : "m"}&output=embed&hl=ko`;
  return <>
    {hardMode
      ? <Suspense fallback={<div className="country-map" role="status">나라 지도 준비 중…</div>}>
          <OfflineCountryMap country={country} detailed={!isFixedMap} />
        </Suspense>
      : <iframe key={source} src={source} title="문제 국가의 위치 지도" className="country-map" loading="eager" allowFullScreen />}
  </>;
});
