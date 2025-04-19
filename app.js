function App() {
  const [appState, setAppState] = React.useState({
    isMobileMenuOpen: false,
    selectedCategory: 'all',
    age: null,
    products: [],
    categories: [],
    loading: true,
  });

  React.useEffect(() => {
    const verifiedAge = localStorage.getItem('ageVerified');
    if (verifiedAge) {
      setAppState((prevState) => ({ ...prevState, age: parseInt(verifiedAge) }));
    }

    // Fetch products from the JSON file
    fetch('/products/products.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        return response.json();
      })
      .then(productsData => {
        // Extract unique categories from products
        const uniqueCategories = [...new Set(productsData.map(product => product.category))];
        
        // Format categories for your UI
        const formattedCategories = uniqueCategories.map(categoryId => {
          // Convert category-id to Category Name format
          const name = categoryId.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          return { id: categoryId, name };
        });

        setAppState((prevState) => ({
          ...prevState,
          categories: formattedCategories,
          products: productsData,
          loading: false,
        }));
      })
      .catch(error => {
        console.error('Error loading products:', error);
        setAppState((prevState) => ({
          ...prevState,
          loading: false,
        }));
      });
  }, []);

  const handleAgeVerification = (isOver21) => {
    if (isOver21) {
      setAppState((prevState) => ({ ...prevState, age: 21 }));
      localStorage.setItem('ageVerified', '21');
    } else {
      setAppState((prevState) => ({ ...prevState, age: 0 }));
    }
  };

  const filteredProducts =
    appState.selectedCategory === 'all'
      ? appState.products
      : appState.products.filter(
          (product) => product.category === appState.selectedCategory
        );

  if (appState.age === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-2xl font-bold mb-6 dark-mode-text">Age Verification</h2>
          <div className="mb-8">
            <i className="fas fa-cannabis text-5xl text-secondary mb-4" aria-hidden="true" tabIndex="-1"></i>
            <p className="dark-mode-text">You must be 21 years or older to enter this website.</p>
          </div>
          <div className="flex flex-col space-y-4">
            <button
              onClick={() => handleAgeVerification(true)}
              className="w-full py-3 bg-primary hover:bg-opacity-90 text-white rounded-lg transition duration-200"
            >
              I am 21 or older
            </button>
            <button
              onClick={() => handleAgeVerification(false)}
              className="w-full py-3 bg-gray-600 dark:bg-gray-700 hover:bg-opacity-90 text-white rounded-lg transition duration-200"
            >
              I am under 21
            </button>
          </div>
          <p className="mt-6 text-sm text-gray-700 dark:text-gray-300">
            By entering, you acknowledge and agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    );
  }

  if (appState.age < 21) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-2xl font-bold mb-4 dark-mode-text">Access Denied</h2>
          <p className="mb-6 dark-mode-text">You must be 21 or older to access this website.</p>
          <button
            onClick={() => setAppState((prevState) => ({ ...prevState, age: null }))}
            className="py-2 px-4 bg-primary hover:bg-opacity-90 text-white rounded-lg transition duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav role="navigation" className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                {/* Logo */}
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mr-2">
                  <i className="fas fa-cannabis text-white" aria-hidden="true" tabIndex="-1"></i>
                </div>
                <span className="font-bold text-xl dark-mode-text">Route 66 Hemp</span>
              </div>
            </div>
            {/* Desktop menu */}
            <div className="hidden md:flex md:items-center md:space-x-6">
              <a href="#" className="dark-mode-text hover:text-primary px-3 py-2 text-sm font-medium transition duration-150">Home</a>
              <a href="#products" className="dark-mode-text hover:text-primary px-3 py-2 text-sm font-medium transition duration-150">Products</a>
              <a href="#about" className="dark-mode-text hover:text-primary px-3 py-2 text-sm font-medium transition duration-150">About</a>
              <a href="#contact" className="dark-mode-text hover:text-primary px-3 py-2 text-sm font-medium transition duration-150">Contact</a>
            </div>
            {/* Mobile menu button */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() =>
                  setAppState((prevState) => ({
                    ...prevState,
                    isMobileMenuOpen: !prevState.isMobileMenuOpen,
                  }))
                }
                className="inline-flex items-center justify-center p-2 rounded-md dark-mode-text hover:text-primary focus:outline-none"
                aria-label={
                  appState.isMobileMenuOpen ? 'Close main menu' : 'Open main menu'
                }
                aria-expanded={appState.isMobileMenuOpen ? 'true' : 'false'}
              >
                <i
                  className={`fas ${
                    appState.isMobileMenuOpen ? 'fa-times' : 'fa-bars'
                  } text-xl`}
                  aria-hidden="true"
                  tabIndex="-1"
                ></i>
              </button>
            </div>
          </div>
        </div>
        {appState.isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <a href="#" className="block dark-mode-text hover:text-primary px-3 py-2 rounded-md text-base font-medium">Home</a>
              <a href="#products" className="block dark-mode-text hover:text-primary px-3 py-2 rounded-md text-base font-medium">Products</a>
              <a href="#about" className="block dark-mode-text hover:text-primary px-3 py-2 rounded-md text-base font-medium">About</a>
              <a href="#contact" className="block dark-mode-text hover:text-primary px-3 py-2 rounded-md text-base font-medium">Contact</a>
              <button 
                className="snipcart-checkout w-full text-left dark-mode-text hover:text-primary px-3 py-2 rounded-md text-base font-medium flex items-center"
              >
                <i className="fas fa-shopping-cart mr-2"></i>
                <span>Cart</span>
                <span className="snipcart-items-count ml-2">(0)</span>
              </button>
            </div>
          </div>
        )}
      </nav>
      <section>
        {/* Hero Section */}
        <div className="relative bg-gray-50 dark:bg-gray-900 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 bg-gray-50 dark:bg-gray-900 sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32">
              <div className="pt-10 sm:pt-16 lg:pt-8 lg:pb-14 lg:overflow-hidden">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="lg:grid lg:grid-cols-2 lg:gap-8">
                    <div className="mx-auto max-w-md px-4 sm:max-w-2xl sm:px-6 sm:text-center lg:px-0 lg:text-left lg:flex lg:items-center">
                      <div className="lg:py-24">
                        <h1 className="mt-4 text-4xl tracking-tight font-extrabold dark-mode-text sm:mt-5 sm:text-6xl lg:mt-6 xl:text-6xl">
                          <span>Premium Hemp Products</span>
                          <span className="text-primary dark:text-secondary block">For Your Wellness</span>
                        </h1>
                        <p className="mt-3 text-base text-gray-700 dark:text-gray-300 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                          Discover our range of high-quality, lab-tested hemp products. From CBD oils to edibles, we have everything you need for a balanced lifestyle.
                        </p>
                        <div className="mt-10 sm:mt-12 flex justify-center lg:justify-start space-x-4">
                          <div className="rounded-md shadow">
                            <a href="#products" className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-white bg-primary dark:hover:bg-gray-700 hover:bg-opacity-90 md:py-4 md:text-lg md:px-10">
                              Explore Products
                            </a>
                          </div>
                          <div className="rounded-md shadow">
                            <a href="#about" className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-white bg-primary dark:hover:bg-gray-700 hover:bg-opacity-90 md:py-4 md:text-lg md:px-10">
                              Learn More
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-12 lg:m-0 lg:relative">
                      <div className="mx-auto max-w-md px-4 sm:max-w-2xl sm:px-6 lg:px-0">
                        <div className="w-full h-64 sm:h-72 md:h-96 rounded-xl shadow-xl bg-gradient-to-br from-green-200 to-green-600 dark:from-green-900 dark:to-green-600 relative overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <i className="fas fa-cannabis text-white text-9xl opacity-30" aria-hidden="true" tabIndex="-1"></i>
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                            <div className="text-center text-white px-4">
                              <div className="font-bold text-2xl sm:text-3xl mb-2">Premium Hemp</div>
                              <div className="text-lg sm:text-xl">Locally Grown, Organically Harvested</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Products Section */}
        <div id="products" className="py-12 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center mb-8">
              <h2 className="text-base text-black dark:text-secondary font-semibold tracking-wide uppercase">Products</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight dark-mode-text sm:text-4xl">
                Explore Our Collection
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-700 dark:text-gray-300 lg:mx-auto">
                Our products are lab tested for quality and purity.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <button
                onClick={() =>
                  setAppState((prevState) => ({
                    ...prevState,
                    selectedCategory: 'all',
                  }))
                }
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  appState.selectedCategory === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 dark:bg-gray-700 dark-mode-text hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                All Products
              </button>
              {appState.categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() =>
                    setAppState((prevState) => ({
                      ...prevState,
                      selectedCategory: category.id,
                    }))
                  }
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    appState.selectedCategory === category.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 dark:bg-gray-700 dark-mode-text hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            {appState.loading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="leaf-loader">
                  <i className="fas fa-cannabis text-primary text-5xl" aria-hidden="true" tabIndex="-1"></i>
                </div>
                <span className="sr-only">Loading products...</span>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group product-card p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow"
                  >
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-md mb-4"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/images/placeholder.png';
                      }}
                    />
                    <h3 className="text-lg font-bold dark-mode-text">{product.name}</h3>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{product.description}</p>
                    <p className="mt-2 font-medium text-gray-900 dark:text-gray-100">${product.price.toFixed(2)}</p>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`text-xs ${i < Math.floor(product.rating) ? 'fas fa-star text-yellow-600' : 'far fa-star text-yellow-600'}`}
                          aria-hidden="true"
                          tabIndex="-1"
                        ></i>
                      ))}
                      <span className="ml-1 text-xs text-gray-700 dark:text-gray-300">({product.rating})</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-700 dark:text-gray-300">Products Coming Soon</p>
              </div>
            )}
          </div>
        </div>
        {/* About Section */}
        <div id="about" className="py-12 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center mb-10">
              <h2 className="text-base text-black dark:text-secondary font-semibold tracking-wide uppercase">About Us</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight dark-mode-text sm:text-4xl">
                Our Story
              </p>
            </div>
            <div className="mt-10">
              <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
                <div className="relative lg:row-start-1 lg:col-start-2">
                  <div className="relative text-base mx-auto lg:max-w-none">
                    <div className="aspect-w-2 aspect-h-1 rounded-lg shadow-xl overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-r from-green-800 to-green-600 flex items-center justify-center p-6">
                        <div className="text-center text-white">
                          <i className="fas fa-leaf text-6xl mb-4" aria-hidden="true" tabIndex="-1"></i>
                          <h3 className="text-2xl font-bold mb-2">From Seed to Sale</h3>
                          <p className="text-lg">We control every step of the process to ensure the highest quality products</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-10 lg:mt-0 lg:row-start-1 lg:col-start-1">
                  <div className="text-base max-w-prose mx-auto lg:max-w-none">
                    <p className="text-lg text-gray-700 dark:text-gray-300">
                      Founded in 2025, Route 66 Hemp started with a simple mission: to provide high-quality hemp products that enhance people's well-being while promoting sustainable agricultural practices.
                    </p>
                    <div className="mt-5 prose prose-indigo dark:prose-invert text-gray-700 dark:text-gray-300">
                      <p>
                        Our team of experts carefully selects the finest hemp strains and works closely with local farmers who share our commitment to organic growing methods and environmental stewardship.
                      </p>
                      <p>
                        We pride ourselves on transparency. All our products undergo rigorous third-party testing to ensure purity, potency, and safety. The test results are readily available to our customers, giving you peace of mind with every purchase.
                      </p>
                      <p>
                        At Route 66 Hemp, we're a community of hemp enthusiasts and wellness advocates dedicated to educating and empowering individuals to make informed choices about their health and wellness journey.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Features */}
            <div className="mt-16">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <div className="pt-6">
                  <div className="flow-root bg-white dark:bg-gray-800 rounded-lg shadow-lg px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-secondary rounded-md shadow-lg">
                          <i className="fas fa-flask text-white text-xl" aria-hidden="true" tabIndex="-1"></i>
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium tracking-tight dark-mode-text">Lab Tested</h3>
                      <p className="mt-5 text-base text-gray-700 dark:text-gray-300">
                        All our products are tested by third-party labs for potency, pesticides, and purity to ensure you get only the highest quality.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pt-6">
                  <div className="flow-root bg-white dark:bg-gray-800 rounded-lg shadow-lg px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-secondary rounded-md shadow-lg">
                          <i className="fas fa-leaf text-white text-xl" aria-hidden="true" tabIndex="-1"></i>
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium tracking-tight dark-mode-text">Organically Grown</h3>
                      <p className="mt-5 text-base text-gray-700 dark:text-gray-300">
                        Our hemp is grown using organic practices, free from harmful pesticides and chemicals, resulting in a cleaner, better product.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pt-6">
                  <div className="flow-root bg-white dark:bg-gray-800 rounded-lg shadow-lg px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-secondary rounded-md shadow-lg">
                          <i className="fas fa-users text-white text-xl" aria-hidden="true" tabIndex="-1"></i>
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium tracking-tight dark-mode-text">Expert Guidance</h3>
                      <p className="mt-5 text-base text-gray-700 dark:text-gray-300">
                        Our knowledgeable staff is here to help you find the right products for your specific needs and answer any questions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Contact Section */}
        <div id="contact" className="py-12 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center mb-10">
              <h2 className="text-base text-black dark:text-secondary font-semibold tracking-wide uppercase">Contact Us</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight dark-mode-text sm:text-4xl">
                Get In Touch
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-700 dark:text-gray-300 lg:mx-auto">
                Have questions? We're here to help!
              </p>
            </div>
            <div id="store-info" className="mt-10 flex justify-center">
              <div className="lg:w-1/2">
                <div className="text-center">
                  <h3 className="text-lg font-medium dark-mode-text mb-4">Store Information</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow p-6">
                    <div className="flex flex-col items-center mb-6">
                      <div className="flex-shrink-0 mb-2">
                        <i className="fas fa-map-marker-alt text-secondary text-xl" aria-hidden="true" tabIndex="-1"></i>
                      </div>
                      <div className="text-base text-gray-700 dark:text-gray-300">
                        <p>14076 State Hwy Z</p>
                        <p>St Robert, MO 65584</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center mb-6">
                      <div className="flex-shrink-0">
                        <i className="fas fa-phone-alt text-secondary text-xl" aria-hidden="true" tabIndex="-1"></i>
                      </div>
                      <div className="ml-3 text-base text-gray-700 dark:text-gray-300">
                        <p>+1 (555) 123-4567</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center mb-6">
                      <div className="flex-shrink-0">
                        <i className="fas fa-envelope text-secondary text-xl" aria-hidden="true" tabIndex="-1"></i>
                      </div>
                      <div className="ml-3 text-base text-gray-700 dark:text-gray-300">
                        <p>route66hemp@gmail.com</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="flex-shrink-0">
                        <i className="fas fa-clock text-secondary text-xl" aria-hidden="true" tabIndex="-1"></i>
                      </div>
                      <div className="ml-3 text-base text-gray-700 dark:text-gray-300 lg:text-center">
                        <p className="font-medium dark-mode-text">Store Hours:</p>
                        <p>Monday - Thursday: 11:00 AM - 9:00 PM</p>
                        <p>Friday - Saturday: 11:00 AM - 10:00 PM</p>
                        <p>Sunday: Closed</p>
                      </div>
                    </div>
                    <div className="mt-8">
                      <p className="font-medium dark-mode-text">Follow Us:</p>
                      <div className="flex flex-col space-y-2 mt-2 lg:flex-row lg:space-x-6 lg:space-y-0 lg:justify-center justify-center gap-x-4">
                        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary lg:text-center" aria-label="Facebook">
                          <i className="fab fa-facebook text-2xl" aria-hidden="true" tabIndex="-1"></i>
                          <span className="sr-only">Facebook</span>
                        </a>
                        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary lg:text-center" aria-label="Instagram">
                          <i className="fab fa-instagram text-2xl" aria-hidden="true" tabIndex="-1"></i>
                          <span className="sr-only">Instagram</span>
                        </a>
                        <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-primary lg:text-center" aria-label="Twitter">
                          <i className="fab fa-twitter text-2xl" aria-hidden="true" tabIndex="-1"></i>
                          <span className="sr-only">Twitter</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer role = "contentinfo" className="bg-gray-800 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8 xl:col-span-1">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mr-2">
                  <i className="fas fa-cannabis text-white" aria-hidden="true" tabIndex="-1"></i>
                </div>
                <span className="font-bold text-xl text-white">Route 66 Hemp</span>
              </div>
              <p className="text-gray-300 text-base">
                Premium hemp products for your wellness journey. Quality you can trust.
              </p>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-white" aria-label="Facebook">
                  <i className="fab fa-facebook text-xl" aria-hidden="true" tabIndex="-1"></i>
                  <span className="sr-only">Facebook</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-white" aria-label="Instagram">
                  <i className="fab fa-instagram text-xl" aria-hidden="true" tabIndex="-1"></i>
                  <span className="sr-only">Instagram</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-white" aria-label="Twitter">
                  <i className="fab fa-twitter text-xl" aria-hidden="true" tabIndex="-1"></i>
                  <span className="sr-only">Twitter</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-white" aria-label="YouTube">
                  <i className="fab fa-youtube text-xl" aria-hidden="true" tabIndex="-1"></i>
                  <span className="sr-only">YouTube</span>
                </a>
              </div>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Products</h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <a href="#" className="text-base text-gray-400 hover:text-white">
                        CBD Oils
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-400 hover:text-white">
                        Edibles
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-400 hover:text-white">
                        Topicals
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-400 hover:text-white">
                        Hemp Flower
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-400 hover:text-white">
                        Accessories
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Company</h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <a href="#" className="text-base text-gray-400 hover:text-white">
                        About Us
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-400 hover:text-white">
                        Blog
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-400 hover:text-white">
                        Careers
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-400 hover:text-white">
                        Press
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-400 hover:text-white">
                        Partners
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Support</h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <a href="#" className="text-base text-gray-400 hover:text-white">
                        Contact Us
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-400 hover:text-white">
                        FAQs
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-400 hover:text-white">
                        Shipping & Returns
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-400 hover:text-white">
                        Track Order
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Legal</h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <a href="#" className="text-base text-gray-400 hover:text-white">
                        Privacy Policy
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-400 hover:text-white">
                        Terms of Service
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-400 hover:text-white">
                        Cookie Policy
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-400 hover:text-white">
                        Compliance
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-700 pt-8">
            <p className="text-base text-gray-400 text-center">
              &copy; 2025 Route 66 Hemp. All rights reserved.
            </p>
            <p className="text-sm text-gray-400 text-center mt-2">
              All products contain less than 0.3% THC and are legal under the 2018 Farm Bill.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
