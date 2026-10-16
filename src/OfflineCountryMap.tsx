import { memo, useMemo } from "react";
import { geoContains, geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import atlas from "world-atlas/countries-50m.json";

const topology = atlas as unknown as Topology<{ countries: GeometryCollection }>;
const countries = feature(topology, topology.objects.countries).features;

// Bundled geographic data: no map key, external tiles, or answer labels.
export default memo(function OfflineCountryMap({ country, detailed }: {
  country: { lat: number; lng: number; zoom: number }; detailed: boolean;
}) {
  const paths = useMemo(() => {
    const point: [number, number] = [country.lng, country.lat];
    const projection = geoMercator()
      .rotate([-country.lng, 0])
      .center([0, Math.max(-80, Math.min(80, country.lat))])
      .scale(detailed ? 160 * 2 ** Math.min(country.zoom - 1, 6) : 320)
      .translate([500, 250])
      .clipExtent([[0, 0], [1000, 500]]);
    const path = geoPath(projection);
    return countries.map((shape, index) => ({
      id: shape.id ?? index, outline: path(shape) ?? "",
      selected: geoContains(shape, point),
    }));
  }, [country.lat, country.lng, country.zoom, detailed]);

  return <div className="country-map offline-country-map">
    <svg viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice" role="img" aria-label="국가명 없는 나라 위치 지도. 가운데 표시된 나라 이름을 입력하세요.">
      {paths.map(shape => <path key={shape.id} d={shape.outline} className={shape.selected ? "offline-country is-selected" : "offline-country"} />)}
      <circle cx="500" cy="250" r="14" className="offline-location-halo" />
      <circle cx="500" cy="250" r="5" className="offline-location-dot" />
    </svg>
    <span className="offline-map-credit">Natural Earth · 위치·국경 학습용 지도</span>
  </div>;
});
