// NAP (Name, Address, Phone) Component for consistency across pages
function LocalBusinessInfo({ variant = "full", className = "" }) {
  const businessInfo = {
    name: "Route 66 Hemp",
    address: {
      street: "14076 State Hwy Z",
      city: "St Robert",
      state: "MO",
      zip: "65584",
      full: "14076 State Hwy Z, St Robert, MO 65584"
    },
    phone: "+1 (573) 677-6418",
    phoneLink: "tel:+15736776418",
    email: "route66hemp@gmail.com",
    emailLink: "mailto:route66hemp@gmail.com",
    hours: {
      "Monday - Thursday": "11:00 AM - 9:00 PM",
      "Friday - Saturday": "11:00 AM - 10:00 PM",
      "Sunday": "11:00 AM - 7:00 PM"
    }
  };

  if (variant === "minimal") {
    return (
      <div className={`text-sm ${className}`}>
        <div className="font-medium">{businessInfo.name}</div>
        <div>{businessInfo.address.full}</div>
        <a
          href={businessInfo.phoneLink}
          className="text-primary dark:text-blue-400 hover:underline"
        >
          {businessInfo.phone}
        </a>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <span className={className}>
        {businessInfo.name} • {businessInfo.address.city}, {businessInfo.address.state} • 
        <a
          href={businessInfo.phoneLink}
          className="text-primary dark:text-blue-400 hover:underline ml-1"
        >
          {businessInfo.phone}
        </a>
      </span>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-medium dark-mode-text mb-4">
          Store Information
        </h3>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow p-6">
          <div className="flex flex-col items-center mb-6">
            <div className="shrink-0 mb-2">
              <i
                className="fas fa-map-marker-alt text-secondary text-xl"
                aria-hidden="true"
              />
            </div>
            <div className="text-base text-gray-700 dark:text-gray-300 text-center">
              <div className="font-medium dark-mode-text">{businessInfo.name}</div>
              <p>{businessInfo.address.street}</p>
              <p>{businessInfo.address.city}, {businessInfo.address.state} {businessInfo.address.zip}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center mb-6">
            <div className="shrink-0 mb-2">
              <i
                className="fas fa-phone-alt text-secondary text-xl"
                aria-hidden="true"
              />
            </div>
            <div className="text-base text-gray-700 dark:text-gray-300">
              <a
                href={businessInfo.phoneLink}
                className="hover:text-primary dark:hover:text-blue-400 transition-colors"
              >
                {businessInfo.phone}
              </a>
            </div>
          </div>
          
          <div className="flex flex-col items-center mb-6">
            <div className="shrink-0 mb-2">
              <i
                className="fas fa-envelope text-secondary text-xl"
                aria-hidden="true"
              />
            </div>
            <div className="text-base text-gray-700 dark:text-gray-300">
              <a
                href={businessInfo.emailLink}
                className="hover:text-primary dark:hover:text-blue-400 transition-colors"
              >
                {businessInfo.email}
              </a>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="shrink-0 mb-2">
              <i
                className="fas fa-clock text-secondary text-xl"
                aria-hidden="true"
              />
            </div>
            <div className="text-base text-gray-700 dark:text-gray-300 text-center">
              <p className="font-medium dark-mode-text mb-2">Store Hours:</p>
              {Object.entries(businessInfo.hours).map(([days, hours]) => (
                <p key={days}>{days}: {hours}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocalBusinessInfo;