const VeterinaryCare = () => {
  return (
    <div className="min-h-screen bg-teal-50 py-16 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-lg overflow-hidden">
        <div className="p-8 md:p-12">
          <h2 className="text-4xl font-bold text-teal-900 mb-6">Expert Veterinary Care</h2>
          <p className="text-lg text-teal-700 mb-8">
            Our in-house clinic ensures every rescued cat gets immediate medical attention. We also offer affordable care for community cats.
          </p>
          
          <div className="space-y-6">
            <div className="border-l-4 border-teal-500 pl-4">
              <h3 className="text-xl font-bold text-stone-800">Spay & Neuter Program</h3>
              <p className="text-stone-600 mt-1">Crucial for controlling the stray population and ensuring a healthier life for the cats.</p>
            </div>
            <div className="border-l-4 border-teal-500 pl-4">
              <h3 className="text-xl font-bold text-stone-800">Vaccinations & Deworming</h3>
              <p className="text-stone-600 mt-1">Protecting our feline friends from common and preventable diseases.</p>
            </div>
            <div className="border-l-4 border-teal-500 pl-4">
              <h3 className="text-xl font-bold text-stone-800">Emergency Trauma Care</h3>
              <p className="text-stone-600 mt-1">Round-the-clock care for injured rescues brought into our facility.</p>
            </div>
          </div>
          
          <button className="mt-10 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-xl transition-colors">
            Book an Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

export default VeterinaryCare;