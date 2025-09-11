// Google Business Profile integration suggestions and review display

function GoogleBusinessIntegration() {
    const reviews = [
        {
            id: 1,
            author: 'Ray',
            rating: 5,
            text: "Best place in this area to go for quality cannabis, awesome customer service, and great pricing!! The owners are super friendly down to earth people with all around good vibes! Definitely check them out next time you're in need or if you're looking to try something new.",
            verified: true,
        },
        {
            id: 2,
            author: 'Jessica',
            rating: 5,
            text: 'Great place with REALLY good pricing AND quality! Everyone there has been so friendly and down to the earth, you will definitely feel welcome and will want to come back! This is my new favorite spot!',
            verified: true,
        },
        {
            id: 3,
            author: 'Lauren',
            rating: 5,
            text: 'Love this place! Great products, friendly people!',
            verified: true,
        },
    ]

    return (
        <div className="bg-white py-12 dark:bg-gray-800">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-10 lg:text-center">
                    <h2 className="text-2xl font-semibold uppercase tracking-wide text-green-600 dark:text-green-400">
                        Customer Reviews
                    </h2>
                    <p className="mt-2 text-3xl font-extrabold leading-8 tracking-tight sm:text-4xl dark:text-white">
                        What Our St Robert Customers Say
                    </p>
                </div>

                {/* Reviews Grid */}
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            className="rounded-lg bg-gray-50 p-6 dark:bg-gray-800"
                        >
                            <div className="mb-3 flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
                                        <span className="text-sm font-semibold text-white">
                                            {review.author
                                                .split(' ')
                                                .map((n) => n[0])
                                                .join('')}
                                        </span>
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <div className="flex items-center">
                                        <span className="font-medium text-black dark:text-white">
                                            {review.author}
                                        </span>
                                        {review.verified && (
                                            <i
                                                className="fas fa-check-circle ml-1 text-xs text-blue-500"
                                                aria-hidden="true"
                                            />
                                        )}
                                    </div>
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <i
                                                key={i}
                                                className={`text-xs ${
                                                    i < review.rating
                                                        ? 'fas fa-star text-yellow-500'
                                                        : 'far fa-star text-yellow-500'
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
                            <p className="text-sm text-black dark:text-white">
                                {review.text}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Google Business Profile CTA */}
                <div className="rounded-lg bg-gradient-to-br from-blue-800 to-blue-900 p-8 text-center">
                    <h3 className="mb-4 text-2xl font-bold text-white dark:text-white">
                        Find Us on Google Maps
                    </h3>
                    <p className="mb-6 text-white dark:text-white">
                        Get directions, see our hours, read reviews, and stay
                        updated with our latest posts.
                    </p>
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <a
                            href="https://www.google.com/maps/search/Route+66+Hemp+St+Robert+MO"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center rounded-lg bg-white px-6 py-3 font-medium text-blue-600 transition-colors hover:bg-gray-100"
                            aria-label="View on Google Maps"
                        >
                            <i
                                className="fab fa-google mr-2"
                                aria-hidden="true"
                            />
                            View on Google Maps
                        </a>
                        <a
                            href="https://g.page/r/CVdnXoVBYQSVEAE/review"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center rounded-lg border-2 border-white bg-transparent px-6 py-3 font-medium text-white transition-colors hover:bg-white hover:text-blue-600"
                            aria-label="Leave a review for Route 66 Hemp"
                        >
                            <i
                                className="fas fa-star mr-2"
                                aria-hidden="true"
                            />
                            Leave a Review
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default GoogleBusinessIntegration
