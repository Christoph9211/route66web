// FAQ component with local SEO focus
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faPhone,
    faChevronUp,
    faChevronDown,
} from '@fortawesome/free-solid-svg-icons'
import { businessInfo } from '../utils/businessInfo.js'

function LocalSEOFAQ() {
    const faqs = [
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
            question:
                'Is Route 66 Hemp a licensed hemp dispensary in Missouri?',
            answer: 'Yes, Route 66 Hemp operates as a licensed hemp retailer in Missouri. We comply with all state regulations and only sell hemp products containing less than 0.3% THC as required by the 2018 Farm Bill.',
        },
        {
            question: 'Do you offer delivery in the St Robert area?',
            answer: 'Currently, we operate as a retail storefront in St Robert. Please visit us at our State Highway Z location or call (573) 677-6418 for current service options in the Pulaski County area.',
        },
    ]

    const [openIndex, setOpenIndex] = React.useState(null)

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <div className="bg-gray-50 py-12 dark:bg-gray-900">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="mb-10 text-center">
                    <h2 className="text-2xl font-semibold uppercase tracking-wide text-green-600 dark:text-green-400">
                        Frequently Asked Questions
                    </h2>
                    <p className="mt-2 text-3xl font-extrabold leading-8 tracking-tight sm:text-4xl dark:text-white">
                        About Route 66 Hemp in St Robert
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="rounded-lg bg-white shadow-md dark:bg-gray-800"
                        >
                            <button
                                className="flex w-full items-center justify-between rounded-lg px-6 py-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                                onClick={() => toggleFAQ(index)}
                                aria-expanded={openIndex === index}
                                aria-controls={`faq-answer-${index}`}
                            >
                                <span className="pr-4 font-medium dark:text-white">
                                    {faq.question}
                                </span>
                                <FontAwesomeIcon
                                    icon={
                                        openIndex === index
                                            ? faChevronUp
                                            : faChevronDown
                                    }
                                    className="text-secondary flex-shrink-0"
                                />
                            </button>
                            {openIndex === index && (
                                <div
                                    id={`faq-answer-${index}`}
                                    className="px-6 pt-4 pb-4 border-t border-gray-200 dark:border-gray-700"
                                    role="region"
                                    aria-labelledby={`faq-question-${index}`}
                                >
                                    <p className="text-gray-700 dark:text-white">
                                        {faq.answer}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-10 text-center">
                    <p className="mb-4 font-semibold text-black dark:text-white">
                        Have more questions about our St Robert hemp store?
                    </p>
                    <a
                        href="tel:+15736776418"
                        className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-opacity-90"
                    >
                        <FontAwesomeIcon icon={faPhone} className="mr-2" />
                        Call (573) 677-6418
                    </a>
                </div>
            </div>
        </div>
    )
}

export default LocalSEOFAQ
