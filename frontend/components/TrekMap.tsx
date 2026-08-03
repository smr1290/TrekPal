'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapLocation } from '@/lib/types';

// Fix default marker icons broken by bundlers
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
});

const CATEGORY_COLORS: Record<string, string> = {
    tea_house: '#2f6f4e',
    hospital: '#b45309',
    checkpoint: '#1d4ed8',
    emergency: '#b91c1c',
    trailhead: '#0f766e',
};

function categoryIcon(category: string, isVerified?: boolean) {
    const color = CATEGORY_COLORS[category] || '#334155';
    const border = isVerified ? '2px solid white' : '2px dashed rgba(255,255,255,.85)';
    return L.divIcon({
        className: '',
        html: `<span style="
            display:block;width:14px;height:14px;border-radius:9999px;
            background:${color};border:${border};box-shadow:0 1px 4px rgba(0,0,0,.35);
            opacity:${isVerified === false ? 0.75 : 1};
        "></span>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
    });
}

function FitBounds({ locations }: { locations: MapLocation[] }) {
    const map = useMap();
    useEffect(() => {
        if (!locations.length) return;
        const bounds = L.latLngBounds(locations.map((l) => [l.latitude, l.longitude]));
        map.fitBounds(bounds.pad(0.2));
    }, [locations, map]);
    return null;
}

export default function TrekMap({
    locations,
    selectedId,
    onSelect,
}: {
    locations: MapLocation[];
    selectedId?: number | null;
    onSelect?: (id: number) => void;
}) {
    const center = useMemo<[number, number]>(() => {
        if (!locations.length) return [28.3949, 84.124]; // Nepal center-ish
        const lat = locations.reduce((s, l) => s + l.latitude, 0) / locations.length;
        const lng = locations.reduce((s, l) => s + l.longitude, 0) / locations.length;
        return [lat, lng];
    }, [locations]);

    return (
        <MapContainer
            center={center}
            zoom={8}
            className="h-full w-full rounded-[var(--radius)]"
            scrollWheelZoom
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds locations={locations} />
            {locations.map((loc) => (
                <Marker
                    key={loc.id}
                    position={[loc.latitude, loc.longitude]}
                    icon={categoryIcon(loc.category, loc.is_verified)}
                    opacity={selectedId && selectedId !== loc.id ? 0.55 : 1}
                    eventHandlers={{
                        click: () => onSelect?.(loc.id),
                    }}
                >
                    <Popup>
                        <div className="min-w-[160px]">
                            <strong>{loc.name}</strong>
                            <div style={{ marginTop: 4, fontSize: 12 }}>
                                {loc.category.replace('_', ' ')}
                                {loc.elevation_m != null ? ` · ${loc.elevation_m.toLocaleString()} m` : ''}
                                {loc.is_verified ? ' · verified' : ' · unverified'}
                            </div>
                            {loc.trust_label && (
                                <div style={{ marginTop: 4, fontSize: 11, opacity: 0.85 }}>
                                    {loc.trust_label}
                                </div>
                            )}
                            {loc.description && (
                                <div style={{ marginTop: 6, fontSize: 12 }}>{loc.description}</div>
                            )}
                            {loc.source_note && (
                                <div style={{ marginTop: 6, fontSize: 11, opacity: 0.8 }}>{loc.source_note}</div>
                            )}
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
