// SEO utility functions for local business optimization
export const businessInfo = {
  name: "Route 66 Hemp",
  address: {
    street: "14076 State Hwy Z",
    city: "St Robert",
    state: "MO",
    zip: "65584",
    full: "14076 State Hwy Z, St Robert, MO 65584"
  },
  phone: "+1 (573) 677-6418",
  phoneFormatted: "(573) 677-6418",
  phoneLink: "tel:+15736776418",
  email: "route66hemp@gmail.com",
  emailLink: "mailto:route66hemp@gmail.com",
  website: "https://route66hemp.com",
  coordinates: {
    lat: 37.83490,
    lng: -92.09725
  }
};

export const generateLocalTitle = (pageTitle, includeLocation = true) => {
  const location = includeLocation ? ` | St Robert, MO` : '';
  return `${pageTitle} - ${businessInfo.name}${location}`;
};

export const generateLocalDescription = (baseDescription, includeLocation = true) => {
  const location = includeLocation ? ` Located in St Robert, Missouri, serving Pulaski County and surrounding areas.` : '';
  return `${baseDescription}${location}`;
};

export const generateLocalKeywords = (baseKeywords = []) => {
  const localKeywords = [
    'St Robert MO',
    'St Robert Missouri',
    'Pulaski County',
    'Fort Leonard Wood',
    'Waynesville MO',
    'Central Missouri',
    'Route 66 State Park',
    'hemp store St Robert',
    'CBD St Robert MO',
    'cannabis St Robert',
    'hemp dispensary Missouri',
    'hemp products Pulaski County'
  ];
  
  return [...baseKeywords, ...localKeywords];
};

export const formatPhoneForDisplay = () => businessInfo.phoneFormatted;
export const formatPhoneForTel = () => businessInfo.phoneLink;

export const getBusinessHours = () => ({
  monday: { open: '11:00', close: '21:00' },
  tuesday: { open: '11:00', close: '21:00' },
  wednesday: { open: '11:00', close: '21:00' },
  thursday: { open: '11:00', close: '21:00' },
  friday: { open: '11:00', close: '22:00' },
  saturday: { open: '11:00', close: '22:00' },
  sunday: { open: '11:00', close: '19:00' }
});

export const isCurrentlyOpen = () => {
  const now = new Date();
  const currentDay = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  const currentTime = now.getHours() * 100 + now.getMinutes();
  
  const hours = getBusinessHours();
  const todayHours = hours[currentDay];
  
  if (!todayHours) return false;
  
  const openTime = parseInt(todayHours.open.replace(':', ''));
  const closeTime = parseInt(todayHours.close.replace(':', ''));
  
  return currentTime >= openTime && currentTime <= closeTime;
};

export const generateBreadcrumbSchema = (breadcrumbs) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  };
};

export const generateFAQSchema = (faqs) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
};

export const generateProductSchema = (product) => {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "category": product.category,
    "brand": {
      "@type": "Brand",
      "name": businessInfo.name
    },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": businessInfo.name
      }
    }
  };
};