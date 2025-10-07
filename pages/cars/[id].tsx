// pages/cars/[id].tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Car {
  id: string;
  slug?: string;
  brand?: string;
  name: string;
  price_text?: string;
  price_value?: number;
  image?: string;
  url?: string;
  fuel_type?: string;
  engine?: string;
  mileage?: string;
  transmission?: string;
  seating_capacity?: number | string;
  safety_rating?: string;
  body_type?: string;
  power?: string;
  torque?: string;
}

function normalizeUrl(u?: string) {
  if (!u) return "";
  let s = String(u).trim();
  if (!s) return "";
  if (s.startsWith("//")) return "https:" + s;
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("/")) return s;
  return "https://" + s;
}

export default function CarDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);

  const placeholderSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'><rect width='100%' height='100%' fill='%23eeeeee'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-size='20'>Image not available</text></svg>`;
  const placeholderDataUri = `data:image/svg+xml;utf8,${encodeURIComponent(placeholderSvg)}`;

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch("/data/cars.json");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Car[] = await res.json();
        const found = data.find((c) => String(c.id) === String(id));
        setCar(found || null);
      } catch (err) {
        console.error("Error fetching car details:", err);
        setCar(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Loading car details...</p>;
  if (!car) return <p className="text-center mt-10">Car not found.</p>;

  const imgSrc = normalizeUrl(car.image) || placeholderDataUri;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-blue-50 to-purple-50">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-10 px-6 text-center shadow-md">
        <h1 className="text-3xl font-extrabold">{car.name}</h1>
        <p className="text-lg mt-2">{car.brand} • {car.price_text}</p>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-8 mt-10">
        <Link href="/">
          <button className="mb-6 bg-gray-700 text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition">
            ← Back to Home
          </button>
        </Link>

        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Car Image */}
          <div className="flex justify-center">
            <img
              src={imgSrc}
              alt={car.name}
              className="w-full max-w-md h-72 object-contain rounded-xl border shadow-sm"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = placeholderDataUri;
              }}
            />
          </div>

          {/* Car Details */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{car.name}</h2>
            <p className="text-xl text-blue-600 font-semibold mb-6">
              {car.price_text}
            </p>

            <div className="grid grid-cols-2 gap-4 text-gray-700">
              {car.brand && (
                <div className="p-3 bg-gray-50 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Brand</p>
                  <p className="font-semibold">{car.brand}</p>
                </div>
              )}
              {car.engine && (
                <div className="p-3 bg-gray-50 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Engine</p>
                  <p className="font-semibold">{car.engine}</p>
                </div>
              )}
              {car.mileage && (
                <div className="p-3 bg-gray-50 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Mileage</p>
                  <p className="font-semibold">{car.mileage}</p>
                </div>
              )}
              {car.transmission && (
                <div className="p-3 bg-gray-50 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Transmission</p>
                  <p className="font-semibold">{car.transmission}</p>
                </div>
              )}
              {car.fuel_type && (
                <div className="p-3 bg-gray-50 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Fuel Type</p>
                  <p className="font-semibold">{car.fuel_type}</p>
                </div>
              )}
              {car.seating_capacity && (
                <div className="p-3 bg-gray-50 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Seating</p>
                  <p className="font-semibold">{car.seating_capacity}</p>
                </div>
              )}
              {car.safety_rating && (
                <div className="p-3 bg-gray-50 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Safety</p>
                  <p className="font-semibold">{car.safety_rating}</p>
                </div>
              )}
              {car.body_type && (
                <div className="p-3 bg-gray-50 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Body Type</p>
                  <p className="font-semibold">{car.body_type}</p>
                </div>
              )}
              {car.power && (
                <div className="p-3 bg-gray-50 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Power</p>
                  <p className="font-semibold">{car.power}</p>
                </div>
              )}
              {car.torque && (
                <div className="p-3 bg-gray-50 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">Torque</p>
                  <p className="font-semibold">{car.torque}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Extra Description */}
        <div className="mt-10 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-inner">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Why Choose {car.name}?
          </h3>
          <p className="text-gray-600 leading-relaxed">
            The {car.name} combines performance, comfort, and style. With its
            efficient engine, advanced features, and safety focus, it is ideal
            for city commutes as well as long journeys. Explore the specs above
            to discover why it’s a popular choice in its segment.
          </p>
        </div>

        {car.url && (
          <div className="text-center mt-8">
            <a
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
              href={car.url}
              target="_blank"
              rel="noreferrer"
            >
              Visit Official Page
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
