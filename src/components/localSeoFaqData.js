import { businessInfo } from '../utils/businessInfo.js'

export const localSeoFaqs = [
    {
        question: 'Where is Route 66 Hemp located in St Robert?',
        answer: `${businessInfo.name} is located at ${businessInfo.address.street}, ${businessInfo.address.city}, ${businessInfo.address.state} ${businessInfo.address.zip}. We're conveniently located near Fort Leonard Wood and easily accessible from Waynesville and surrounding Pulaski County areas.`,
    },
    {
        question: 'What are your store hours in St Robert?',
        answer: `We're open Monday-Thursday ${businessInfo.hoursDisplay['Monday - Thursday']}, Friday-Saturday ${businessInfo.hoursDisplay['Friday - Saturday']}, and Sunday ${businessInfo.hoursDisplay['Sunday']}. We serve the St Robert and Central Missouri community with extended weekend hours.`,
    },
    {
        question: 'Do you serve customers from Fort Leonard Wood?',
        answer: 'Yes! We proudly serve military personnel and families from Fort Leonard Wood, as well as customers throughout Pulaski County including Waynesville, Rolla, and Lebanon areas.',
    },
    {
        question:
            'What hemp products do you carry at your St Robert location?',
        answer: 'Our St Robert store carries a full selection of premium hemp products including THCa flower, concentrates, diamonds & sauce, vapes & cartridges, and pre-rolls. All products are lab-tested and compliant with Missouri hemp laws.',
    },
    {
        question: 'Is Route 66 Hemp a licensed hemp dispensary in Missouri?',
        answer: 'Yes, Route 66 Hemp operates as a licensed hemp retailer in Missouri. We comply with all state regulations and only sell hemp products containing less than 0.3% THC as required by the 2018 Farm Bill.',
    },
    {
        question: 'Do you offer delivery in the St Robert area?',
        answer: 'Currently, we operate as a retail storefront in St Robert. Please visit us at our State Highway Z location or call (573) 677-6418 for current service options in the Pulaski County area.',
    },
]
