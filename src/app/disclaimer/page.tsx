import { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Disclaimer - allBooks.co.in",
  description: "Legal disclaimer and terms of use for allBooks.co.in. Important information about affiliate links, pricing, and website usage.",
  keywords: ['disclaimer', 'legal', 'terms', 'affiliate', 'allbooks'],
  openGraph: {
    title: "Disclaimer - allBooks.co.in",
    description: "Legal disclaimer and terms of use for allBooks.co.in",
    type: 'website',
  },
};

export default function DisclaimerPage() {
  return (
    <div className="bg-white min-h-screen">
      <section className="py-8 px-4 text-center bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-4">
            <Breadcrumbs 
              items={[
                { label: 'Home', path: '/' },
                { label: 'Disclaimer', isCurrent: true }
              ]}
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Disclaimer</h1>
          <p className="text-lg text-gray-600">Important legal information about our website and services</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            
            <h2 className="text-2xl font-bold mb-6 text-gray-900">General Information</h2>
            <p className="text-gray-700 mb-4">
              allBooks.co.in is an online book discovery platform that provides information about books, authors, and publishers. 
              We aggregate book information from various sources and provide affiliate links to purchase books from third-party retailers.
            </p>

            <h2 className="text-2xl font-bold mb-6 text-gray-900 mt-8">Affiliate Disclosure</h2>
            <p className="text-gray-700 mb-4">
              This website contains affiliate links to various online bookstores including Amazon, Flipkart, and other retailers. 
              When you click on these links and make a purchase, we may earn a small commission at no additional cost to you. 
              This helps support the maintenance and operation of our website.
            </p>
            <p className="text-gray-700 mb-4">
              We are a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to 
              provide a means for us to earn fees by linking to Amazon.com and affiliated sites.
            </p>

            <h2 className="text-2xl font-bold mb-6 text-gray-900 mt-8">Pricing and Availability</h2>
            <p className="text-gray-700 mb-4">
              All prices displayed on our website are for informational purposes only and may not reflect current prices at the 
              time of purchase. Prices and availability are subject to change without notice. We do not guarantee the accuracy 
              of pricing information and recommend checking the retailer&apos;s website for current prices before making a purchase.
            </p>

            <h2 className="text-2xl font-bold mb-6 text-gray-900 mt-8">Book Information Accuracy</h2>
            <p className="text-gray-700 mb-4">
              While we strive to provide accurate and up-to-date information about books, authors, and publishers, we cannot 
              guarantee the completeness or accuracy of all information displayed on our website. Book details, descriptions, 
              and other information are provided &quot;as is&quot; and may contain errors or omissions.
            </p>

            <h2 className="text-2xl font-bold mb-6 text-gray-900 mt-8">Third-Party Links</h2>
            <p className="text-gray-700 mb-4">
              Our website contains links to third-party websites, including online bookstores and other resources. We are not 
              responsible for the content, privacy policies, or practices of any third-party websites. We encourage users to 
              review the terms and conditions of any third-party websites they visit.
            </p>

            <h2 className="text-2xl font-bold mb-6 text-gray-900 mt-8">Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              allBooks.co.in and its operators shall not be liable for any direct, indirect, incidental, special, or 
              consequential damages arising from the use of our website or the information contained therein. This includes 
              but is not limited to damages for loss of profits, data, or other intangible losses.
            </p>

            <h2 className="text-2xl font-bold mb-6 text-gray-900 mt-8">Intellectual Property</h2>
            <p className="text-gray-700 mb-4">
              Book covers, titles, and author information displayed on our website are the property of their respective 
              copyright holders. We use this information under fair use principles for informational and educational purposes. 
              If you are a copyright holder and believe your work is being used inappropriately, please contact us.
            </p>

            <h2 className="text-2xl font-bold mb-6 text-gray-900 mt-8">Privacy and Data</h2>
            <p className="text-gray-700 mb-4">
              We respect your privacy and are committed to protecting your personal information. Please review our Privacy 
              Policy for detailed information about how we collect, use, and protect your data.
            </p>

            <h2 className="text-2xl font-bold mb-6 text-gray-900 mt-8">Changes to Disclaimer</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify this disclaimer at any time. Changes will be effective immediately upon posting 
              on our website. Your continued use of our website after any changes constitutes acceptance of the modified disclaimer.
            </p>

            <h2 className="text-2xl font-bold mb-6 text-gray-900 mt-8">Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about this disclaimer or our website, please contact us at info@allbooks.co.in
            </p>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                <strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 