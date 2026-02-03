export const businessInfo = {
    name: 'Route 66 Hemp',
    address: {
        street: '14076 State Hwy Z',
        city: 'St Robert',
        state: 'MO',
        zip: '65584',
        full: '14076 State Hwy Z, St Robert, MO 65584',
    },
    phone: '+1 (573) 677-6418',
    phoneFormatted: '(573) 677-6418',
    phoneLink: 'tel:+15736776418',
    email: 'route66hemp@gmail.com',
    emailLink: 'mailto:route66hemp@gmail.com',
    website: 'https://www.route66hemp.com',
    coordinates: {
        lat: 37.8349,
        lng: -92.09725,
    },
    // Standardized hours (used for display and logic)
    hours: {
        monday: { open: '11:00', close: '21:00' },
        tuesday: { open: '11:00', close: '21:00' },
        wednesday: { open: '11:00', close: '21:00' },
        thursday: { open: '11:00', close: '21:00' },
        friday: { open: '11:00', close: '22:00' },
        saturday: { open: '11:00', close: '22:00' },
        sunday: { open: '10:00', close: '18:00' }, // Corrected Sunday hours
    },
    // Display strings for UI
    hoursDisplay: {
        'Monday - Thursday': '11:00 AM - 9:00 PM',
        'Friday - Saturday': '11:00 AM - 10:00 PM',
        Sunday: '10:00 AM - 6:00 PM',
    },
}

