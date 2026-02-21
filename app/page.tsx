"use client"; // This tells Next.js this page is interactive

import React from 'react';
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

const MOCK_CITIES = [
  { name: "Berlin", lat: 52.52, lng: 13.40, savings: 1200 },
  { name: "Warsaw", lat: 52.22, lng: 21.01, savings: 1500 },
  { name: "London", lat: 51.50, lng: -0.12, savings: 800 },
];

export default function Home() {
  const mapToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Header */}
      <div className="w-full p-6 bg-white shadow-sm z-10 text-center">
        <h1 className="text-3xl font-bold text-slate-900">TechSavings Europe</h1>
        <p className="text-slate-500">Phase 1: Discovery Heatmap</p>
      </div>

      {/* Map Container */}
      <div className="w-full h-[calc(100vh-100px)] relative">
        <Map
          initialViewState={{
            longitude: 15.0,
            latitude: 50.0,
            zoom: 3.5
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/navigation-night-v1"
          mapboxAccessToken={mapToken}
        >
          {MOCK_CITIES.map((city) => (
            <Marker key={city.name} longitude={city.lng} latitude={city.lat}>
              <div className="group relative">
                {/* The "Heatmap" Dot */}
                <div className="h-8 w-8 bg-blue-500/50 rounded-full border-2 border-blue-400 animate-pulse cursor-pointer" />
                
                {/* Hover Label */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-sm font-bold">
                  {city.name}: €{city.savings}
                </div>
              </div>
            </Marker>
          ))}
        </Map>
      </div>
    </main>
  );
}