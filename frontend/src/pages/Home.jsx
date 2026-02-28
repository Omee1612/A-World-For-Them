import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen min-w-screen bg-stone-50 flex flex-col items-center justify-center text-center px-4">
      <div className="max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-extrabold text-stone-800 mb-6">
          Every stray deserves a <span className="text-orange-500">safe haven.</span>
        </h1>
        <p className="text-lg md:text-xl text-stone-600 mb-10">
          "A World For Them" is dedicated to rescuing, rehabilitating, and finding loving forever homes for stray cats. Join us in giving them the life they deserve.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/adoption" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full transition-transform hover:scale-105">
            Meet the Cats
          </Link>
          <Link to="/veterinary" className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-full transition-transform hover:scale-105">
            Our Vet Services
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;