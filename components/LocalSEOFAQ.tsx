'use client';
// FAQ component with local SEO focus
import React from 'react'
/**
 * LocalSEOFAQ is a React functional component that renders a section of frequently asked questions
 * about the Route 66 Hemp store in St Robert, Missouri. The component includes a list of questions
 * and their respective answers, as well as a call to action to contact the store for more information.
 *
 * @return {JSX.Element} A JSX element containing the FAQ section.
 */
function LocalSEOFAQ() {
    const faqs = [
        {
            question: 'Where is Route 66 Hemp located in St Robert?',
            answer: "Route 66 Hemp is located at 14076 State Hwy Z, St Robert, MO 65584. We're conveniently located near Fort Leonard Wood and easily accessible from Waynesville and surrounding Pulaski County areas.",
        },
        {
            question: 'What are your store hours in St Robert?',
            answer: "We're open Monday-Thursday 11:00 AM - 9:00 PM, Friday-Saturday 11:00 AM - 10:00 PM, and Sunday 11:00 AM - 7:00 PM. We serve the St Robert and Central Missouri community with extended weekend hours.",
        },
        {
            question: 'Do you serve customers from Fort Leonard Wood?',
            answer: 'Yes! We proudly serve military personnel and families from Fort Leonard Wood, as well as customers throughout Pulaski County including Waynesville, Rolla, and Lebanon areas.',
        },
        {
            question:
                'What hemp products do you carry at your St Robert location?',
            answer: 'Our St Robert store carries a full selection of premium hemp products including CBD flower, concentrates, diamonds & sauce, vapes & cartridges, and pre-rolls. All products are lab-tested and compliant with Missouri hemp laws.',
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

    /**
     * Toggles the openIndex state based on the provided index. 
     * If the openIndex is already equal to the provided index, it sets openIndex to null.
     * Otherwise, it sets openIndex to the provided index. 
     * 
     * @param {number} index - The index to toggle the openIndex state with.
     * @return {void}
     */
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
                                <i
                                    className={`fas ${
                                        openIndex === index
                                            ? 'fa-chevron-up'
                                            : 'fa-chevron-down'
                                    } text-secondary flex-shrink-0`}
                                    aria-hidden="true"
                                />
                            </button>
                            {openIndex === index && (
                                <div
                                    id={`faq-answer-${index}`}
                                    className="px-6 pb-4"
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
                        <i className="fas fa-phone mr-2" aria-hidden="true" />
                        Call (573) 677-6418
                    </a>
                </div>
            </div>
        </div>
    )
}

export default LocalSEOFAQ
