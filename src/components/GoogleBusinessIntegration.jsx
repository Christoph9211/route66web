// Google Business Profile integration suggestions and review display

function GoogleBusinessIntegration() {
  const reviews = [
    {
      id: 1,
      author: "Ray",
      rating: 5,
      text: "Best place in this area to go for quality cannabis, awesome customer service, and great pricing!! The owners are super friendly down to earth people with all around good vibes! Definitely check them out next time you're in need or if you're looking to try something new.",
      verified: true
    },
    {
      id: 2,
      author: "Jessica",
      rating: 5,
      text: "Great place with REALLY good pricing AND quality! Everyone there has been so friendly and down to the earth, you will definitely feel welcome and will want to come back! This is my new favorite spot!",
      verified: true
    },
    {
      id: 3,
      author: "Lauren",
      rating: 5,
      text: "Love this place! Great products, friendly people!",
      verified: true
    }
  ];

  return (
    <div className="py-12 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-10">
          <h2 className="text-2xl font-semibold text-green-600 dark:text-green-400 tracking-wide uppercase">
            Customer Reviews
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight dark:text-white sm:text-4xl">
            What Our St Robert Customers Say
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {reviews.map((review) => (
            <div key={review.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {review.author.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="flex items-center">
                    <span className="font-medium text-black dark:text-white">{review.author}</span>
                    {review.verified && (
                      <i className="fas fa-check-circle text-blue-500 ml-1 text-xs" aria-hidden="true" />
                    )}
                  </div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <i
                        key={i}
                        className={`text-xs ${
                          i < review.rating
                            ? "fas fa-star text-yellow-500"
                            : "far fa-star text-yellow-500"
                        }`}
                        aria-hidden="true"
                      />
                    ))}
                    <span className="ml-2 text-xs text-black dark:text-white">
                      {review.date}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-black dark:text-white text-sm">{review.text}</p>
            </div>
          ))}
        </div>

        {/* Google Business Profile CTA */}
        <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-white dark:text-white mb-4">
            Find Us on Google Maps
          </h3>
          <p className="dark:text-white text-white mb-6">
            Get directions, see our hours, read reviews, and stay updated with our latest posts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://www.google.com/maps/search/Route+66+Hemp+St+Robert+MO"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="View on Google Maps"
            >
              <i className="fab fa-google mr-2" aria-hidden="true" />
              View on Google Maps
            </a>
            <a
              href="https://www.google.com/maps/search/Route+66+Hemp+St+Robert+MO"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-transparent border-2 border-white text-white font-medium rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
              aria-label="Leave a review for Route 66 Hemp"
            >
              <i className="fas fa-star mr-2" aria-hidden="true" />
              Leave a Review
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GoogleBusinessIntegration;