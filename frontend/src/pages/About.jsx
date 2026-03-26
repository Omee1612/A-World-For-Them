const About = () => {
  return (
    <div className="min-h-screen bg-stone-50 py-16 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-stone-800 mb-6">Our Story</h2>
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm text-left">
          <p className="text-lg text-stone-700 mb-6 leading-relaxed">
            "A World For Them" started with a simple belief: that no animal should have to fight for survival on the streets. We saw the growing population of stray cats in our community and knew we had to step up.
          </p>
          <p className="text-lg text-stone-700 leading-relaxed mb-6">
            Today, our shelter is a transitional home where cats heal, play, and learn to trust humans again. Our veterinary clinic works tirelessly to ensure they are physically healthy, while our volunteers provide the love they need to become emotionally ready for adoption.
          </p>
          <h3 className="text-2xl font-bold text-orange-600 mt-10 mb-4">How You Can Help</h3>
          <ul className="list-disc list-inside text-stone-700 space-y-2">
            <li>Adopt a cat and give them a forever home.</li>
            <li>Volunteer at our shelter or clinic.</li>
            <li>Donate to help cover food and medical supplies.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default About;