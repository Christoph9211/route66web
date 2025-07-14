// FAQ component with local SEO focus
function LocalSEOFAQ() {
  const faqs = [
    {
      question: "Where is Route 66 Hemp located in St Robert?",
      answer: "Route 66 Hemp is located at 14076 State Hwy Z, St Robert, MO 65584. We're conveniently located near Fort Leonard Wood and easily accessible from Waynesville and surrounding Pulaski County areas."
    },
    {
      question: "What are your store hours in St Robert?",
      answer: "We're open Monday-Thursday 11:00 AM - 9:00 PM, Friday-Saturday 11:00 AM - 10:00 PM, and Sunday 11:00 AM - 7:00 PM. We serve the St Robert and Central Missouri community with extended weekend hours."
    },
    {
      question: "Do you serve customers from Fort Leonard Wood?",
      answer: "Yes! We proudly serve military personnel and families from Fort Leonard Wood, as well as customers throughout Pulaski County including Waynesville, Rolla, and Lebanon areas."
    },
    {
      question: "What hemp products do you carry at your St Robert location?",
      answer: "Our St Robert store carries a full selection of premium hemp products including CBD flower, concentrates, diamonds & sauce, vapes & cartridges, and pre-rolls. All products are lab-tested and compliant with Missouri hemp laws."
    },
    {
      question: "Is Route 66 Hemp a licensed hemp dispensary in Missouri?",
      answer: "Yes, Route 66 Hemp operates as a licensed hemp retailer in Missouri. We comply with all state regulations and only sell hemp products containing less than 0.3% THC as required by the 2018 Farm Bill."
    },
    {
      question: "Do you offer delivery in the St Robert area?",
      answer: "Currently, we operate as a retail storefront in St Robert. Please visit us at our State Highway Z location or call (573) 677-6418 for current service options in the Pulaski County area."
    }
  ];

  const [openIndex, setOpenIndex] = React.useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-base text-black dark:text-secondary font-semibold tracking-wide uppercase">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight dark-mode-text sm:text-4xl">
            About Route 66 Hemp in St Robert
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg"
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="font-medium dark-mode-text pr-4">{faq.question}</span>
                <i
                  className={`fas ${
                    openIndex === index ? 'fa-chevron-up' : 'fa-chevron-down'
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
                  <p className="text-gray-700 dark:text-gray-300">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Have more questions about our St Robert hemp store?
          </p>
          <a
            href="tel:+15736776418"
            className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors"
            aria-label="Call Route 66 Hemp"
          >
            <i className="fas fa-phone mr-2" aria-hidden="true" />
            Call (573) 677-6418
          </a>
        </div>
      </div>
    </div>
  );
}

export default LocalSEOFAQ;