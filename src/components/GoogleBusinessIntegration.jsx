// Google Business Profile integration suggestions and review display
function GoogleBusinessIntegration() {
  const reviews = [
    {
      id: 1,
      author: "Mike Thompson",
      rating: 5,
      date: "2 weeks ago",
      text: "Great selection of hemp products! Staff is very knowledgeable and helpful. Clean store with fair prices.",
      verified: true
    },
    {
      id: 2,
      author: "Jennifer Davis",
      rating: 5,
      date: "1 month ago", 
      text: "Love this place! Quality products and excellent customer service. They really know their stuff about hemp.",
      verified: true
    },
    {
      id: 3,
      author: "Robert Wilson",
      rating: 4,
      date: "2 months ago",
      text: "Good variety of products. Convenient location near Fort Leonard Wood. Will definitely be back.",
      verified: true
    }
  ];

  const businessStats = {
    rating: 4.8,
    totalReviews: 127,
    responseRate: "100%",
    responseTime: "Within 1 hour"
  };

  return (
    <div className="py-12 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-10">
          <h2 className="text-base text-black dark:text-secondary font-semibold tracking-wide uppercase">
            Customer Reviews
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight dark-mode-text sm:text-4xl">
            What Our St Robert Customers Say
          </p>
        </div>

        {/* Business Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-secondary">{businessStats.rating}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Average Rating</div>
            <div className="flex justify-center mt-1">
              {[...Array(5)].map((_, i) => (
                <i
                  key={i}
                  className={`text-sm ${
                    i < Math.floor(businessStats.rating)
                      ? "fas fa-star text-yellow-500"
                      : "far fa-star text-yellow-500"
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-secondary">{businessStats.totalReviews}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Reviews</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-secondary">{businessStats.responseRate}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Response Rate</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-lg font-bold text-secondary">{businessStats.responseTime}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Response Time</div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {reviews.map((review) => (
            <div key={review.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {review.author.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="flex items-center">
                    <span className="font-medium dark-mode-text">{review.author}</span>
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
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      {review.date}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm">{review.text}</p>
            </div>
          ))}
        </div>

        {/* Google Business Profile CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Find Us on Google Business Profile
          </h3>
          <p className="text-blue-100 mb-6">
            Get directions, see our hours, read reviews, and stay updated with our latest posts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://www.google.com/maps/search/Route+66+Hemp+St+Robert+MO"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="View Route 66 Hemp on Google Maps"
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