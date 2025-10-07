import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Car {
  id: string;
  slug: string;
  brand: string;
  name: string;
  price_text: string;
  image: string;
}

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/cars.json")
      .then((res) => res.json())
      .then((data) => {
        setCars(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading cars:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-10">Loading cars...</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Available Cars</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {cars.map((car) => (
          <div
            key={car.id}
            className="border rounded-xl shadow-lg p-4 bg-white"
          >
            <Image
              src={car.image}
              alt={car.name}
              width={400}
              height={250}
              className="rounded-lg mb-3 object-cover"
            />
            <h2 className="text-xl font-semibold">{car.name}</h2>
            <p className="text-gray-600">{car.brand}</p>
            <p className="text-green-700 font-bold mt-1">{car.price_text}</p>
            <Link href={`/cars/${car.id}`}>
              <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                View Details
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
