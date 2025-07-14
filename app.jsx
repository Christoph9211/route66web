function App() {
  const [appState, setAppState] = React.useState({
    isMobileMenuOpen: false,
    selectedCategory: "all",
    age: null,
    darkMode: false,
    products: [],
    categories: [],
    loading: true,
  });

  React.useEffect(() => {
    const root = document.documentElement;
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    if (storedTheme === "dark" || (!storedTheme && prefersDark)) {
      root.classList.add("dark");
      setAppState((prev) => ({ ...prev, darkMode: true }));
    } else {
      root.classList.remove("dark");
      setAppState((prev) => ({ ...prev, darkMode: false }));
    }

    const verifiedAge = localStorage.getItem("ageVerified");
    if (verifiedAge) {
      setAppState((prevState) => ({
        ...prevState,
        age: parseInt(verifiedAge),
      }));
    }

    // Fetch products from the JSON file
    fetch("products/products.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        return response.json();
      })
      .then((productsData) => {
        // Group products by name and category, combining size options and prices
        const grouped = {};
        productsData.forEach((prod) => {
          // Use name+category as key
          const key =
            (prod.name || prod["name"]) +
            "|" +
            (prod.category || prod["category"]);
          if (!grouped[key]) {
            grouped[key] = {
              ...prod,
              size_options: prod.size_options
                ? [...prod.size_options]
                : prod.size_options || [],
              prices: prod.prices ? { ...prod.prices } : prod.prices || {},
              variants: [],
              ids: [prod.id],
              images: [prod.image],
              descriptions: [prod.description],
              ratings: [prod.rating],
              urls: [prod.url],
            };
            if (prod.size_options && prod.prices) {
              // Already in new format
            } else if (prod.name && prod.name.match(/ - (.+)/)) {
              // Try to extract size from name
              const size = prod.name.match(/ - (.+)/)[1];
              grouped[key].size_options = [size];
              grouped[key].prices = { [size]: prod.price };
            } else {
              grouped[key].size_options = [];
              grouped[key].prices = {};
            }
          } else {
            // Add size/price if not present
            if (prod.name && prod.name.match(/ - (.+)/)) {
              const size = prod.name.match(/ - (.+)/)[1];
              if (!grouped[key].size_options.includes(size)) {
                grouped[key].size_options.push(size);
                grouped[key].prices[size] = prod.price;
              }
            }
            grouped[key].ids.push(prod.id);
            grouped[key].images.push(prod.image);
            grouped[key].descriptions.push(prod.description);
            grouped[key].ratings.push(prod.rating);
            grouped[key].urls.push(prod.url);
          }
        });
        const groupedProducts = Object.values(grouped);
        // Extract unique categories from products
        const uniqueCategories = [
          ...new Set(groupedProducts.map((product) => product.category)),
        ];
        // Format categories for your UI
        const formattedCategories = uniqueCategories.map((categoryId) => {
          const name = categoryId
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
          return { id: categoryId, name };
        });
        setAppState((prevState) => ({
          ...prevState,
          categories: formattedCategories,
          products: groupedProducts,
          loading: false,
        }));
      })
      .catch((error) => {
        console.error("Error loading products:", error);
        setAppState((prevState) => ({
          ...prevState,
          loading: false,
        }));
      });
  }, []);

  const handleAgeVerification = (isOver21) => {
    if (isOver21) {
      setAppState((prevState) => ({ ...prevState, age: 21 }));
      localStorage.setItem("ageVerified", "21");
    } else {
      setAppState((prevState) => ({ ...prevState, age: 0 }));
    }
  };

  const toggleDarkMode = () => {
    const root = document.documentElement;
    setAppState((prev) => {
      const newDark = !prev.darkMode;
      if (newDark) {
        root.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        root.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return { ...prev, darkMode: newDark };
    });
  };

  const filteredProducts =
    appState.selectedCategory === "all"
      ? appState.products
      : appState.products.filter(
          (product) => product.category === appState.selectedCategory
        );

  if (appState.age === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-2xl font-bold mb-6 dark-mode-text">
            Age Verification
          </h2>
          <div className="mb-8">
            <i
              className="fas fa-cannabis text-5xl text-secondary mb-4"
              aria-hidden="true"
              tabIndex="-1"
            ></i>
            <p className="dark-mode-text">
              You must be 21 years or older to enter this website.
            </p>
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
            By entering, you acknowledge and agree to our{" "}
            <a href="/terms-of-service.html">Terms of Service</a> and{" "}
            <a href="/privacy-policy.html">Privacy Policy</a>.
          </p>
        </div>
      </div>
    );
  }

  if (appState.age < 21) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <h2 className="text-2xl font-bold mb-4 dark-mode-text">
            Access Denied
          </h2>
          <p className="mb-6 dark-mode-text">
            You must be 21 or older to access this website.
          </p>
          <button
            onClick={() =>
              setAppState((prevState) => ({ ...prevState, age: null }))
            }
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
                  <i
                    className="fas fa-cannabis text-white"
                    aria-hidden="true"
                    tabIndex="-1"
                  ></i>
                </div>
                <span className="font-bold text-xl dark-mode-text">
                  Route 66 Hemp
                </span>
              </div>
            </div>
            {/* Desktop menu */}
            <div className="hidden md:flex md:items-center md:space-x-6">
              <a
                href="#"
                className="dark-mode-text hover:text-primary px-3 py-2 text-sm font-medium transition duration-150"
              >
                Home
              </a>
              <a
                href="#products"
                className="dark-mode-text hover:text-primary px-3 py-2 text-sm font-medium transition duration-150"
              >
                Products
              </a>
              <a
                href="#about"
                className="dark-mode-text hover:text-primary px-3 py-2 text-sm font-medium transition duration-150"
              >
                About
              </a>
              <a
                href="#contact"
                className="dark-mode-text hover:text-primary px-3 py-2 text-sm font-medium transition duration-150"
              >
                Contact
              </a>
            </div>
            <button
              onClick={toggleDarkMode}
              className="hidden md:inline-flex items-center ml-4 p-2 rounded-md dark-mode-text hover:text-primary"
              aria-label="Toggle dark mode"
            >
              <i
                className={`fas ${
                  appState.darkMode ? "fa-sun" : "fa-moon"
                } text-xl`}
                aria-hidden="true"
                tabIndex="-1"
              ></i>
            </button>
            {/* Mobile menu button */}
            <div className="flex md:hidden items-center">
              <button
                type="button"
                onClick={() =>
                  setAppState((prevState) => ({
                    ...prevState,
                    isMobileMenuOpen: !prevState.isMobileMenuOpen,
                  }))
                }
                className="inline-flex items-center justify-center p-2 rounded-md dark-mode-text hover:text-primary focus:outline-none"
                aria-label={
                  appState.isMobileMenuOpen
                    ? "Close main menu"
                    : "Open main menu"
                }
                aria-expanded={appState.isMobileMenuOpen ? "true" : "false"}
              >
                <i
                  className={`fas ${
                    appState.isMobileMenuOpen ? "fa-times" : "fa-bars"
                  } text-xl`}
                  aria-hidden="true"
                  tabIndex="-1"
                ></i>
              </button>
              <button
                onClick={toggleDarkMode}
                className="ml-3 p-2 rounded-md dark-mode-text hover:text-primary"
                aria-label="Toggle dark mode"
              >
                <i
                  className={`fas ${
                    appState.darkMode ? "fa-sun" : "fa-moon"
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
              <a
                href="#"
                className="block dark-mode-text hover:text-primary px-3 py-2 rounded-md text-base font-medium"
              >
                Home
              </a>
              <a
                href="#products"
                className="block dark-mode-text hover:text-primary px-3 py-2 rounded-md text-base font-medium"
              >
                Products
              </a>
              <a
                href="#about"
                className="block dark-mode-text hover:text-primary px-3 py-2 rounded-md text-base font-medium"
              >
                About
              </a>
              <a
                href="#contact"
                className="block dark-mode-text hover:text-primary px-3 py-2 rounded-md text-base font-medium"
              >
                Contact
              </a>
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
                          <span className="text-primary dark:text-secondary block">
                            For Your Wellness
                          </span>
                        </h1>
                        <p className="mt-3 text-base text-gray-700 dark:text-gray-300 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                          Discover our range of high-quality, lab-tested hemp
                          products. From CBD oils to edibles, we have everything
                          you need for a balanced lifestyle.
                        </p>
                        <div className="mt-10 sm:mt-12 flex justify-center lg:justify-start space-x-4">
                          <div className="rounded-md shadow">
                            <a
                              href="#products"
                              className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-white bg-primary dark:hover:bg-gray-700 hover:bg-opacity-90 md:py-4 md:text-lg md:px-10"
                            >
                              Explore Products
                            </a>
                          </div>
                          <div className="rounded-md shadow">
                            <a
                              href="#about"
                              className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-white bg-primary dark:hover:bg-gray-700 hover:bg-opacity-90 md:py-4 md:text-lg md:px-10"
                            >
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
                            <i
                              className="fas fa-cannabis text-white text-9xl opacity-30"
                              aria-hidden="true"
                              tabIndex="-1"
                            ></i>
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                            <div className="text-center text-white px-4">
                              <div className="font-bold text-2xl sm:text-3xl mb-2">
                                Premium Hemp
                              </div>
                              <div className="text-lg sm:text-xl">
                                Locally Grown, Organically Harvested
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
        </div>
        {/* Products Section */}
        <div id="products" className="py-12 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center mb-8">
              <h2 className="text-base text-black dark:text-secondary font-semibold tracking-wide uppercase">
                Products
              </h2>
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
                    selectedCategory: "all",
                  }))
                }
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  appState.selectedCategory === "all"
                    ? "bg-primary text-white"
                    : "bg-gray-200 dark:bg-gray-700 dark-mode-text hover:bg-gray-300 dark:hover:bg-gray-600"
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
                      ? "bg-primary text-white"
                      : "bg-gray-200 dark:bg-gray-700 dark-mode-text hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            {appState.loading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="leaf-loader">
                  <i
                    className="fas fa-cannabis text-primary text-5xl"
                    aria-hidden="true"
                    tabIndex="-1"
                  ></i>
                </div>
                <span className="sr-only">Loading products...</span>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.name + product.category}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-700 dark:text-gray-300">
                  Products Coming Soon
                </p>
              </div>
            )}
          </div>
        </div>
        {/* About Section */}
        <div id="about" className="py-12 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center mb-10">
              <h2 className="text-base text-black dark:text-secondary font-semibold tracking-wide uppercase">
                About Us
              </h2>
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
                          <i
                            className="fas fa-leaf text-6xl mb-4"
                            aria-hidden="true"
                            tabIndex="-1"
                          ></i>
                          <h3 className="text-2xl font-bold mb-2">
                            From Seed to Sale
                          </h3>
                          <p className="text-lg">
                            We control every step of the process to ensure the
                            highest quality products
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-10 lg:mt-0 lg:row-start-1 lg:col-start-1">
                  <div className="text-base max-w-prose mx-auto lg:max-w-none">
                    <p className="text-lg text-gray-700 dark:text-gray-300">
                      Founded in 2025, Route 66 Hemp started with a simple
                      mission: to provide high-quality hemp products that
                      enhance people's well-being while promoting sustainable
                      agricultural practices.
                    </p>
                    <div className="mt-5 prose prose-indigo dark:prose-invert text-gray-700 dark:text-gray-300">
                      <p>
                        Our team of experts carefully selects the finest hemp
                        strains and works closely with local farmers who share
                        our commitment to organic growing methods and
                        environmental stewardship.
                      </p>
                      <p>
                        We pride ourselves on transparency. All our products
                        undergo rigorous third-party testing to ensure purity,
                        potency, and safety. The test results are readily
                        available to our customers, giving you peace of mind
                        with every purchase.
                      </p>
                      <p>
                        At Route 66 Hemp, we're a community of hemp enthusiasts
                        and wellness advocates dedicated to educating and
                        empowering individuals to make informed choices about
                        their health and wellness journey.
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
                          <i
                            className="fas fa-flask text-white text-xl"
                            aria-hidden="true"
                            tabIndex="-1"
                          ></i>
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium tracking-tight dark-mode-text">
                        Lab Tested
                      </h3>
                      <p className="mt-5 text-base text-gray-700 dark:text-gray-300">
                        All our products are tested by third-party labs for
                        potency, pesticides, and purity to ensure you get only
                        the highest quality.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pt-6">
                  <div className="flow-root bg-white dark:bg-gray-800 rounded-lg shadow-lg px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-secondary rounded-md shadow-lg">
                          <i
                            className="fas fa-leaf text-white text-xl"
                            aria-hidden="true"
                            tabIndex="-1"
                          ></i>
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium tracking-tight dark-mode-text">
                        Organically Grown
                      </h3>
                      <p className="mt-5 text-base text-gray-700 dark:text-gray-300">
                        Our hemp is grown free from harmful pesticides and
                        chemicals, resulting in a cleaner, better product.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pt-6">
                  <div className="flow-root bg-white dark:bg-gray-800 rounded-lg shadow-lg px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-secondary rounded-md shadow-lg">
                          <i
                            className="fas fa-users text-white text-xl"
                            aria-hidden="true"
                            tabIndex="-1"
                          ></i>
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium tracking-tight dark-mode-text">
                        Expert Guidance
                      </h3>
                      <p className="mt-5 text-base text-gray-700 dark:text-gray-300">
                        Our knowledgeable staff is here to help you find the
                        right products for your specific needs and answer any
                        questions.
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
              <h2 className="text-base text-black dark:text-secondary font-semibold tracking-wide uppercase">
                Contact Us
              </h2>
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
                  <h3 className="text-lg font-medium dark-mode-text mb-4">
                    Store Information
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow p-6">
                    <div className="flex flex-col items-center mb-6">
                      <div className="flex-shrink-0 mb-2">
                        <i
                          className="fas fa-map-marker-alt text-secondary text-xl"
                          aria-hidden="true"
                          tabIndex="-1"
                        ></i>
                      </div>
                      <div className="text-base text-gray-700 dark:text-gray-300">
                        <p>14076 State Hwy Z</p>
                        <p>St Robert, MO 65584</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center mb-6">
                      <div className="flex-shrink-0">
                        <i
                          className="fas fa-phone-alt text-secondary text-xl"
                          aria-hidden="true"
                          tabIndex="-1"
                        ></i>
                      </div>
                      <div className="ml-3 text-base text-gray-700 dark:text-gray-300">
                        <p>+1 (573) 677-6418</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center mb-6">
                      <div className="flex-shrink-0">
                        <i
                          className="fas fa-envelope text-secondary text-xl"
                          aria-hidden="true"
                          tabIndex="-1"
                        ></i>
                      </div>
                      <div className="ml-3 text-base text-gray-700 dark:text-gray-300">
                        <p>route66hemp@gmail.com</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="flex-shrink-0">
                        <i
                          className="fas fa-clock text-secondary text-xl"
                          aria-hidden="true"
                          tabIndex="-1"
                        ></i>
                      </div>
                      <div className="ml-3 text-base text-gray-700 dark:text-gray-300 lg:text-center">
                        <p className="font-medium dark-mode-text">
                          Store Hours:
                        </p>
                        <p>Monday - Thursday: 11:00 AM - 9:00 PM</p>
                        <p>Friday - Saturday: 11:00 AM - 10:00 PM</p>
                        <p>Sunday: 11:00 AM - 7:00 PM</p>
                      </div>
                    </div>
                    <div className="mt-8">
                      <p className="font-medium dark-mode-text">Follow Us:</p>
                      <div className="flex flex-col space-y-2 mt-2 lg:flex-row lg:space-x-6 lg:space-y-0 lg:justify-center justify-center gap-x-4">
                        <a
                          href="https://www.facebook.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:text-primary lg:text-center"
                          aria-label="Facebook"
                        >
                          <i
                            className="fab fa-facebook text-2xl"
                            aria-hidden="true"
                            tabIndex="-1"
                          ></i>
                          <span className="sr-only">Facebook</span>
                        </a>
                        <a
                          href="https://www.instagram.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:text-primary lg:text-center"
                          aria-label="Instagram"
                        >
                          <i
                            className="fab fa-instagram text-2xl"
                            aria-hidden="true"
                            tabIndex="-1"
                          ></i>
                          <span className="sr-only">Instagram</span>
                        </a>
                        <a
                          href="https://www.twitter.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:text-primary lg:text-center"
                          aria-label="Twitter"
                        >
                          <i
                            className="fab fa-twitter text-2xl"
                            aria-hidden="true"
                            tabIndex="-1"
                          ></i>
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
      <footer role="contentinfo" className="bg-gray-800 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8 xl:col-span-1">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mr-2">
                  <i
                    className="fas fa-cannabis text-white"
                    aria-hidden="true"
                    tabIndex="-1"
                  ></i>
                </div>
                <span className="font-bold text-xl text-white">
                  Route 66 Hemp
                </span>
              </div>
              <p className="text-gray-300 text-base">
                Premium hemp products for your wellness journey. Quality you can
                trust.
              </p>
              <div className="flex space-x-6">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white"
                  aria-label="Facebook"
                >
                  <i
                    className="fab fa-facebook text-xl"
                    aria-hidden="true"
                    tabIndex="-1"
                  ></i>
                  <span className="sr-only">Facebook</span>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white"
                  aria-label="Instagram"
                >
                  <i
                    className="fab fa-instagram text-xl"
                    aria-hidden="true"
                    tabIndex="-1"
                  ></i>
                  <span className="sr-only">Instagram</span>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white"
                  aria-label="Twitter"
                >
                  <i
                    className="fab fa-twitter text-xl"
                    aria-hidden="true"
                    tabIndex="-1"
                  ></i>
                  <span className="sr-only">Twitter</span>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white"
                  aria-label="YouTube"
                >
                  <i
                    className="fab fa-youtube text-xl"
                    aria-hidden="true"
                    tabIndex="-1"
                  ></i>
                  <span className="sr-only">YouTube</span>
                </a>
              </div>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
                    Products
                  </h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <a
                        href="#"
                        className="text-base text-gray-400 hover:text-white"
                      >
                        Edibles
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-base text-gray-400 hover:text-white"
                      >
                        Topicals
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-base text-gray-400 hover:text-white"
                      >
                        Flower
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-base text-gray-400 hover:text-white"
                      >
                        Accessories
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
                    Company
                  </h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <a
                        href="#"
                        className="text-base text-gray-400 hover:text-white"
                      >
                        About Us
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-base text-gray-400 hover:text-white"
                      >
                        Careers
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-base text-gray-400 hover:text-white"
                      >
                        Partners
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
                    Support
                  </h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <a
                        href="#"
                        className="text-base text-gray-400 hover:text-white"
                      >
                        Contact Us
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-base text-gray-400 hover:text-white"
                      >
                        FAQs
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
                    Legal
                  </h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <a
                        href="/privacy-policy.html"
                        className="text-base text-gray-400 hover:text-white"
                      >
                        Privacy Policy
                      </a>
                    </li>
                    <li>
                      <a
                        href="/terms-of-service.html"
                        className="text-base text-gray-400 hover:text-white"
                      >
                        Terms of Service
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-base text-gray-400 hover:text-white"
                      >
                        Cookie Policy
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-base text-gray-400 hover:text-white"
                      >
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
              All products contain less than 0.3% THC and are legal under the
              2018 Farm Bill.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ProductCard component for displaying product with size dropdown and dynamic price
function ProductCard({ product }) {
  // Generate combined options if both flavors and size_options exist
  let combinedOptions = [];
  if (
    // Do we have flavors?
    product.flavors &&
    // Are there any flavors?
    product.flavors.length > 0 &&
    // Do we have size options?
    product.size_options &&
    // Are there any size options?
    product.size_options.length > 0
  ) {
    // Combine each flavor with each size option
    combinedOptions = product.flavors.flatMap((flavor) =>
      product.size_options.map((size) => ({
        // Create a label that's the combination of flavor and size
        label: `${flavor} - ${size}`,
        // Store the flavor and size for later use
        flavor,
        size,
      }))
    );
  }

  // State for combined selection
  const [selectedCombo, setSelectedCombo] = React.useState(
    combinedOptions.length > 0 ? combinedOptions[0] : null
  );
  // Fallback for only size or only flavor
  const [selectedSize, setSelectedSize] = React.useState(
    !combinedOptions.length &&
      product.size_options &&
      product.size_options.length > 0
      ? product.size_options[0]
      : null
  );
  const [selectedFlavor, setSelectedFlavor] = React.useState(
    !combinedOptions.length && product.flavors && product.flavors.length > 0
      ? product.flavors[0]
      : null
  );

  // Determine price
  let price = product.price;
  if (combinedOptions.length > 0 && selectedCombo) {
    // If we have combined options, check if the price is defined for the selected size
    if (product.prices && product.prices[selectedCombo.size] !== undefined) {
      price = product.prices[selectedCombo.size];
    }
  } else if (
    selectedSize &&
    product.prices &&
    product.prices[selectedSize] !== undefined
  ) {
    // If we have a selected size, check if the price is defined for that size
    price = product.prices[selectedSize];
  } else if (!selectedSize && selectedFlavor && product.price) {
    // If we have a selected flavor but no selected size, use the default price
    price = product.price;
  }

  // Determine banner based on selected variant
  let banner = product.banner;
  let bannerKey = null;
  if (combinedOptions.length > 0 && selectedCombo) {
    bannerKey = selectedCombo.label;
  } else if (selectedSize) {
    bannerKey = selectedSize;
  } else if (selectedFlavor) {
    bannerKey = selectedFlavor;
  }
  if (bannerKey && product.availability) {
    if (product.availability[bannerKey]) {
      banner = product.availability[bannerKey];
    } else if (selectedCombo && product.availability[selectedCombo.size]) {
      banner = product.availability[selectedCombo.size];
    } else if (selectedFlavor && product.availability[selectedFlavor]) {
      banner = product.availability[selectedFlavor];
    } else if (selectedSize && product.availability[selectedSize]) {
      banner = product.availability[selectedSize];
    }
  }

  // Render a product card with the given product data
  // This component is complicated because it needs to handle three different cases:
  // 1. The product has both flavors and size options
  // 2. The product has only flavors
  // 3. The product has only size options
  // It also needs to dynamically calculate the price based on the selected flavor and size
  return (
    <div
      className="relative group product-card p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow"
      // This class is for the card shadow effect
    >
      {banner && (
        <div className="product-banner" aria-label={banner}>
          {banner}
        </div>
      )}
      <img
        src={
          // If the product has an image, use it
          product.image ||
          // If the product has an array of images, use the first one
          (product.images && product.images[0]) ||
          // If the product has no images, use a placeholder image
          "/assets/images/placeholder.webp"
        }
        alt={product.name}
        className="w-full h-50 object-cover rounded-md mb-4"
        // This class is for the image height and object-fit
        onError={(e) => {
          // If the image fails to load, use a placeholder image
          e.target.onerror = null;
          e.target.src = "/assets/images/placeholder.webp";
        }}
      />
      <h3 className="text-lg font-bold dark-mode-text">{product.name}</h3>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-300">
        {product.category}
      </p>
      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
        {product.description ||
          (product.descriptions && product.descriptions[0])}
      </p>
      {/* Combined dropdown for flavor + size */}
      {combinedOptions.length > 0 && (
        <div className="mt-2">
          <label
            htmlFor={`combo-${product.name}`}
            className="block text-xs text-gray-600 dark:text-gray-300 mb-1"
          >
            Flavor & Size:
          </label>
          <select
            id={`combo-${product.name}`}
            className="w-full p-2 rounded border border-gray-300 dark:bg-gray-800 dark:text-white"
            value={selectedCombo ? selectedCombo.label : ""}
            onChange={(e) => {
              // When the user selects a new option, update the selectedCombo state
              const combo = combinedOptions.find(
                (opt) => opt.label === e.target.value
              );
              setSelectedCombo(combo);
            }}
            aria-label="Select flavor and size"
          >
            {combinedOptions.map((opt) => (
              <option key={opt.label} value={opt.label}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}
      {/* Size dropdown (if no flavors) */}
      {!combinedOptions.length &&
        product.size_options &&
        product.size_options.length > 0 && (
          <div className="mt-2">
            <label
              htmlFor={`size-${product.name}`}
              className="block text-xs text-gray-600 dark:text-gray-300 mb-1"
            >
              {/* Use 'Strain' for Vapes & Carts and Other, otherwise 'Size' */}
              {["Vapes & Carts", "Other"].includes(product.category)
                ? "Strain:"
                : "Size:"}
            </label>
            <select
              id={`size-${product.name}`}
              className="w-full p-2 rounded border border-gray-300 dark:bg-gray-800 dark:text-white"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              aria-label={
                ["Vapes & Carts", "Other"].includes(product.category)
                  ? "Select strain"
                  : "Select size"
              }
            >
              {product.size_options.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      {/* Flavor dropdown (if no sizes) */}
      {!combinedOptions.length &&
        product.flavors &&
        product.flavors.length > 0 && (
          <div className="mt-2">
            <label
              htmlFor={`flavor-${product.name}`}
              className="block text-xs text-gray-600 dark:text-gray-300 mb-1"
            >
              Flavor:
            </label>
            <select
              id={`flavor-${product.name}`}
              className="w-full p-2 rounded border border-gray-300 dark:bg-gray-800 dark:text-white"
              value={selectedFlavor}
              onChange={(e) => setSelectedFlavor(e.target.value)}
              aria-label="Select flavor"
            >
              {product.flavors.map((flavor) => (
                <option key={flavor} value={flavor}>
                  {flavor}
                </option>
              ))}
            </select>
          </div>
        )}
      <p className="mt-2 font-medium text-gray-900 dark:text-gray-100">
        {/* Dynamically calculate the price based on the selected flavor and size */}
        ${price ? price.toFixed(2) : "N/A"}
      </p>
      <div className="flex items-center mt-1">
        {/* Render the rating stars */}
        {[...Array(5)].map((_, i) => (
          <i
            key={i}
            className={`text-xs ${
              i <
              Math.floor(
                product.rating || (product.ratings && product.ratings[0]) || 5
              )
                ? "fas fa-star text-yellow-600"
                : "far fa-star text-yellow-600"
            }`}
            aria-hidden="true"
            tabIndex={"-1"}
          ></i>
        ))}
        <span className="ml-1 text-xs text-gray-700 dark:text-gray-300">
          {/* Show the rating number */}(
          {product.rating || (product.ratings && product.ratings[0]) || 5})
        </span>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
