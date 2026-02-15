import { businessInfo } from '../utils/businessInfo.js'

export const localSeoFaqs = [
    {
        question: 'Where is Route 66 Hemp located in St Robert?',
        answer: `${businessInfo.name} is located at ${businessInfo.address.street}, ${businessInfo.address.city}, ${businessInfo.address.state} ${businessInfo.address.zip}. Our storefront is close to I-44 and convenient for shoppers coming from Fort Leonard Wood, Waynesville, and surrounding Pulaski County areas.`,
    },
    {
        question: 'What are your store hours in St Robert?',
        answer: `Our current hours are Monday-Thursday ${businessInfo.hoursDisplay['Monday - Thursday']}, Friday-Saturday ${businessInfo.hoursDisplay['Friday - Saturday']}, and Sunday ${businessInfo.hoursDisplay['Sunday']}. For the most up-to-date schedule, call before visiting.`,
    },
    {
        question: 'Do you serve customers from Fort Leonard Wood?',
        answer: 'Yes. We regularly serve service members, military families, and civilians from Fort Leonard Wood, plus shoppers from St Robert, Waynesville, and other Pulaski County communities.',
    },
    {
        question:
            'What hemp products do you carry at your St Robert location?',
        answer: 'Our St Robert menu includes THCa flower, pre-rolls, concentrates, edibles, diamonds and sauce, and vape options. We prioritize lab-tested products with clear cannabinoid and potency information.',
    },
    {
        question: 'Is Route 66 Hemp a licensed hemp dispensary in Missouri?',
        answer: 'Route 66 Hemp operates as a Missouri hemp retailer and follows applicable state and federal hemp requirements, including selling products that meet Farm Bill THC limits.',
    },
    {
        question: 'Do you offer delivery in the St Robert area?',
        answer: 'We currently operate as an in-store retail location in St Robert. Call (573) 677-6418 for current pickup details and service updates.',
    },
]
