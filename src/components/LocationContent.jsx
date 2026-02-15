// Location-specific content component for local SEO

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faMapMarkedAlt,
    faCheckCircle,
    faLandmark,
    faMapPin,
    faUsers,
    faShippingFast,
    faHandshake,
} from '@fortawesome/free-solid-svg-icons'

function LocationContent() {
    const locationData = {
        city: 'St Robert',
        state: 'Missouri',
        county: 'Pulaski County',
        region: 'Central Missouri',
        nearbyAreas: [
            'Fort Leonard Wood',
            'Waynesville',
            'Rolla',
            'Lebanon',
            'Crocker',
        ],
        landmarks: [
            'Fort Leonard Wood Military Base',
            'Route 66 State Park',
            'Gasconade River',
            'Mark Twain National Forest',
        ],
    }

    return (
        <div className="bg-gray-50 py-12 dark:bg-gray-900">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-10 lg:text-center">
                    <h2 className="text-base font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
                        Serving {locationData?.city || 'our area'} and
                        Surrounding Communities
                    </h2>
                    <p className="mt-2 text-3xl font-extrabold leading-snug tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                        Local Hemp Dispensary Access in{' '}
                        {locationData?.region || 'your region'}
                    </p>
                    <p className="mt-4 max-w-2xl text-xl text-gray-700 lg:mx-auto dark:text-white">
                        Route 66 Hemp serves
                        {' '}
                        {locationData?.city || 'community'},{' '}
                        {locationData?.state || 'state'}, Fort Leonard Wood,
                        and nearby Pulaski County areas with lab-tested THCa
                        and hemp products.
                    </p>
                </div>

                <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
                        <h3 className="mb-4 text-xl font-bold dark:text-white">
                            <FontAwesomeIcon
                                icon={faMapMarkedAlt}
                                className="mr-2 text-green-600"
                            />
                            Areas We Serve
                        </h3>
                        <p className="mb-4 text-gray-700 dark:text-white">
                            Our storefront on State Highway Z in{' '}
                            {locationData?.city || 'your city'} is an easy
                            stop for shoppers across{' '}
                            {locationData?.county || 'your county'} and the
                            greater {locationData?.region || 'your region'}.
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {locationData?.nearbyAreas?.map((area) => (
                                <div
                                    key={area}
                                    className="flex items-center text-sm text-gray-600 dark:text-white"
                                >
                                    <FontAwesomeIcon
                                        icon={faCheckCircle}
                                        className="mr-2 text-xs text-green-600"
                                    />
                                    {area}
                                </div>
                            )) || (
                                    <p className="text-gray-700 dark:text-white">
                                        No nearby areas available.
                                    </p>
                                )}
                        </div>
                    </div>

                    <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
                        <h3 className="mb-4 text-xl font-bold dark:text-white">
                            <FontAwesomeIcon
                                icon={faLandmark}
                                className="mr-2 text-green-600"
                            />
                            Easy to Find Near Local Landmarks
                        </h3>
                        <p className="mb-4 text-gray-700 dark:text-white">
                            Use these familiar{' '}
                            {locationData?.city || 'city'} and{' '}
                            {locationData?.region || 'region'} landmarks for
                            quick directions to our store:
                        </p>
                        <div className="space-y-2">
                            {locationData?.landmarks?.map((landmark) => (
                                <div
                                    key={landmark}
                                    className="flex items-center text-sm text-gray-600 dark:text-white"
                                >
                                    <FontAwesomeIcon
                                        icon={faMapPin}
                                        className="mr-2 text-xs text-green-600"
                                    />
                                    {landmark}
                                </div>
                            )) || (
                                    <p className="text-gray-700 dark:text-white">
                                        No landmarks available.
                                    </p>
                                )}
                        </div>
                    </div>
                </div>

                <div className="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
                    <h3 className="mb-6 text-center text-2xl font-bold dark:text-white">
                        Why Local Shoppers Choose Route 66 Hemp in{' '}
                        {locationData?.city || 'our city'}?
                    </h3>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-600">
                                <FontAwesomeIcon
                                    icon={faUsers}
                                    className="text-2xl text-white"
                                />
                            </div>
                            <h4 className="mb-2 text-lg font-semibold dark:text-white">
                                Local Expertise
                            </h4>
                            <p className="text-sm text-gray-700 dark:text-white">
                                As a locally focused team in{' '}
                                {locationData?.city || 'our city'}, we help
                                customers compare THCa and hemp options based
                                on experience level and preferences.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-600">
                                <FontAwesomeIcon
                                    icon={faShippingFast}
                                    className="text-2xl text-white"
                                />
                            </div>
                            <h4 className="mb-2 text-lg font-semibold dark:text-white">
                                Convenient Location
                            </h4>
                            <p className="text-sm text-gray-700 dark:text-white">
                                Easy access from Fort Leonard Wood,
                                Waynesville, and communities across{' '}
                                {locationData?.county || 'our county'}.
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-600">
                                <FontAwesomeIcon
                                    icon={faHandshake}
                                    className="text-2xl text-white"
                                />
                            </div>
                            <h4 className="mb-2 text-lg font-semibold dark:text-white">
                                Community Focused
                            </h4>
                            <p className="text-sm text-gray-700 dark:text-white">
                                We are committed to dependable service,
                                transparent product information, and a better
                                local shopping experience.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LocationContent
