// FAQ component with local SEO focus
import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faPhone,
    faChevronUp,
    faChevronDown,
} from '@fortawesome/free-solid-svg-icons'
import { localSeoFaqs } from './localSeoFaqData.js'

function LocalSEOFAQ() {
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
                    <p className="mt-2 text-3xl font-extrabold leading-snug tracking-tight sm:text-4xl dark:text-white">
                        About Route 66 Hemp in St Robert
                    </p>
                </div>

                <div className="space-y-4">
                    {localSeoFaqs.map((faq, index) => (
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
