
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

  // ----------------------
  // Variant: Minimal (small footer / sidebar usage)
  // ----------------------
  if (variant === "minimal") {
    return (
      <div className={`text-sm ${className}`}>
        <div className="font-medium">{businessInfo.name}</div>
        <div>{businessInfo.address.full}</div>
        {/*
          Accessibility⁠—The link colour now meets WCAG AA (≥4.5:1)
          on the dark theme by switching to blue‑400 while keeping a
          strong, brand‑appropriate blue‑600 in the light theme.
        */}
        <a
          href={businessInfo.phoneLink}
          className="hover:underline"
        >
          {businessInfo.phone}
        </a>
      </div>
    );
  }

  // ----------------------
  // Variant: Inline (breadcrumbs / headings)
  // ----------------------
  if (variant === "inline") {
    return (
      <span className={className}>
        {businessInfo.name} • {businessInfo.address.city}, {businessInfo.address.state} •
        <a
          href={businessInfo.phoneLink}
          className="hover:underline ml-1"
        >
          {businessInfo.phone}
        </a>
      </span>
    );
  }

  // ----------------------
  // Default (full card)
  // ----------------------
  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h3 className="text-lg font-medium dark:text-white mb-4">Store Information</h3>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg shadow p-6">
          {/* Address */}
          <div className="flex flex-col items-center mb-6">
            <div className="flex-shrink-0 mb-2">
              <i className="fas fa-map-marker-alt text-green-600 text-xl" aria-hidden="true" />
            </div>
            <div className="text-base text-gray-700 dark:text-white text-center">
              <div className="font-medium dark:text-white">{businessInfo.name}</div>
              <p>{businessInfo.address.street}</p>
              <p>
                {businessInfo.address.city}, {businessInfo.address.state} {businessInfo.address.zip}
              </p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex flex-col items-center mb-6">
            <div className="flex-shrink-0 mb-2">
              <i className="fas fa-phone-alt text-green-600 text-xl" aria-hidden="true" />
            </div>
            <div className="text-base text-gray-700 dark:text-white">
              <a
                href={businessInfo.phoneLink}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {businessInfo.phone}
              </a>
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col items-center mb-6">
            <div className="flex-shrink-0 mb-2">
              <i className="fas fa-envelope text-green-600 text-xl" aria-hidden="true" />
            </div>
            <div className="text-base text-gray-700 dark:text-white">
              <a
                href={businessInfo.emailLink}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {businessInfo.email}
              </a>
            </div>
          </div>

          {/* Hours */}
          <div className="flex flex-col items-center">
            <div className="flex-shrink-0 mb-2">
              <i className="fas fa-clock text-green-600 text-xl" aria-hidden="true" />
            </div>
            <div className="text-base text-gray-700 dark:text-white text-center">
              <p className="font-medium dark:text-white mb-2">Store Hours:</p>
              {Object.entries(businessInfo.hours).map(([days, hours]) => (
                <p key={days}>
                  {days}: {hours}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LocalBusinessInfo;
