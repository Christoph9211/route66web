// Location-specific content component for local SEO

function LocationContent() {
  const locationData = {
    city: "St Robert",
    state: "Missouri",
    county: "Pulaski County",
    region: "Central Missouri",
    nearbyAreas: [
      "Fort Leonard Wood",
      "Waynesville", 
      "Rolla",
      "Lebanon",
      "Crocker"
    ],
    landmarks: [
      "Fort Leonard Wood Military Base",
      "Route 66 State Park",
      "Gasconade River",
      "Mark Twain National Forest"
    ]
  };

return (
  <div className="py-12 bg-gray-50 dark:bg-gray-900">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="lg:text-center mb-10">
        <h2 className="text-base text-green-600 dark:text-secondary font-semibold tracking-wide uppercase">
          Serving {locationData?.city || "our area"} & Surrounding Areas
        </h2>
        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight dark:text-white sm:text-4xl">
          Your Local Hemp Store in {locationData?.region || "your region"}
        </p>
        <p className="mt-4 max-w-2xl text-xl text-white dark:text-white lg:mx-auto">
          Proudly serving the {locationData?.city || "community"}, {locationData?.state || "state"} community with premium hemp products since 2025.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold dark:text-white mb-4">
            <i className="fas fa-map-marked-alt text-green-600 mr-2" aria-hidden="true" />
            Areas We Serve
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Located conveniently on State Highway Z in {locationData?.city || "your city"}, we serve customers throughout {locationData?.county || "your county"} and the greater {locationData?.region || "your region"} area.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {locationData?.nearbyAreas?.map((area) => (
              <div key={area} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <i className="fas fa-check-circle text-green-600 mr-2 text-xs" aria-hidden="true" />
                {area}
              </div>
            )) || <p className="text-gray-700 dark:text-gray-300">No nearby areas available.</p>}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold dark:text-white mb-4">
            <i className="fas fa-landmark text-green-600 mr-2" aria-hidden="true" />
            Near Local Landmarks
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Find us easily near these well-known {locationData?.city || "city"} and {locationData?.region || "region"} landmarks:
          </p>
          <div className="space-y-2">
            {locationData?.landmarks?.map((landmark) => (
              <div key={landmark} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <i className="fas fa-map-pin text-green-600 mr-2 text-xs" aria-hidden="true" />
                {landmark}
              </div>
            )) || <p className="text-gray-700 dark:text-gray-300">No landmarks available.</p>}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <h3 className="text-2xl font-bold dark:text-white mb-6 text-center">
          Why Choose Route 66 Hemp in {locationData?.city || "our city"}?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-users text-white text-2xl" aria-hidden="true" />
            </div>
            <h4 className="text-lg font-semibold dark:text-white mb-2">Local Expertise</h4>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              As a locally-owned business in {locationData?.city || "our city"}, we understand our community's needs and preferences.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-shipping-fast text-white text-2xl" aria-hidden="true" />
            </div>
            <h4 className="text-lg font-semibold dark:text-white mb-2">Convenient Location</h4>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              Easy access from Fort Leonard Wood, Waynesville, and throughout {locationData?.county || "our county"}.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-handshake text-white text-2xl" aria-hidden="true" />
            </div>
            <h4 className="text-lg font-semibold dark:text-white mb-2">Community Focused</h4>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              Committed to supporting the {locationData?.city || "our city"} community with quality products and service.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default LocationContent;