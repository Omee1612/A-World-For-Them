const Adoption = () => {
  // Dummy data: Later, replace this with a fetch call to your backend
  const cats = [
    { id: 1, name: "Luna", age: "2 Years", trait: "Cuddly & Shy", img: "/assets/cat1.jpg" },
    { id: 2, name: "Oliver", age: "6 Months", trait: "Playful Energy", img: "/assets/cat2.jpg" },
    { id: 3, name: "Milo", age: "4 Years", trait: "Calm Observer", img: "/assets/dog1.jpg" },
  ];

  return (
    <div className="min-h-screen bg-amber-50/50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-stone-800 mb-4 text-center">Looking for a Home</h2>
        <p className="text-center text-stone-600 mb-12 max-w-2xl mx-auto">
          These beautiful souls are fully vaccinated, neutered/spayed, and waiting for a family to call their own.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cats.map((cat) => (
            <div key={cat.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <img src={cat.img} alt={cat.name} className="w-full h-56 object-cover" />
              <div className="p-6">
                <h3 className="text-2xl font-bold text-orange-600">{cat.name}</h3>
                <p className="text-stone-500 text-sm mt-1">{cat.age} • {cat.trait}</p>
                <button className="mt-4 w-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold py-2 rounded-lg transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Adoption;