import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <main className="flex-grow">
        <section className="min-h-screen flex flex-col justify-center items-center px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">Welcome to Digital Queue</h1>
            <p className="text-xl text-gray-400 mb-6">Streamline your waiting experience with our innovative SaaS solution</p>
            <p className="text-lg text-gray-300">Join thousands of businesses revolutionizing their queue management</p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12">
            <div className="md:w-1/2">
              <Image
                src="https://placehold.co/500x300"
                alt="Digital Queue App Mockup"
                width={500}
                height={300}
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="md:w-1/2 space-y-6">
              <h2 className="text-3xl font-semibold">Transform Your Queue Management</h2>
              <p className="text-gray-400">Say goodbye to long lines and frustrated customers. Digital Queue brings efficiency and convenience to your business.</p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li>Reduce wait times by up to 40%</li>
                <li>Improve customer satisfaction</li>
                <li>Optimize staff allocation</li>
                <li>Get real-time analytics and insights</li>
              </ul>
              <Button className="bg-white hover:bg-gray-200 text-black">
                <Image src="https://placehold.co/24x24" alt="Google Play Store" width={24} height={24} className="mr-2" />
                Download on Google Play
              </Button>
            </div>
          </div>
          <div className="text-center">
            <p className="text-xl text-gray-300 mb-4">Trusted by leading brands worldwide</p>
            <div className="flex justify-center space-x-8">
              {/* Replace with actual client logos */}
              <div className="w-20 h-20 bg-gray-500 rounded-full"></div>
              <div className="w-20 h-20 bg-gray-500 rounded-full"></div>
              <div className="w-20 h-20 bg-gray-500 rounded-full"></div>
              <div className="w-20 h-20 bg-gray-500 rounded-full"></div>
            </div>
          </div>
        </section>

        <section className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-gray-900">
          <h2 className="text-4xl font-bold text-center mb-12">Why Choose Digital Queue?</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl">
            <Card className="bg-white text-black">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Reduce Wait Times</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Our smart algorithm optimizes queue management, significantly cutting down wait times. Experience up to 40% reduction in average waiting periods.</p>
                <ul className="list-disc list-inside">
                  <li>Smart queue distribution</li>
                  <li>Predictive wait time estimates</li>
                  <li>Automated customer notifications</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-white text-black">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Improve Customer Satisfaction</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Keep your customers happy and engaged with real-time updates and estimated wait times. Our system has shown to increase customer satisfaction rates by 60%.</p>
                <ul className="list-disc list-inside">
                  <li>Real-time queue status updates</li>
                  <li>Virtual queuing options</li>
                  <li>Personalized customer experience</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-white text-black">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Boost Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Streamline your operations and allocate resources more effectively with our analytics tools. Businesses report an average 25% increase in operational efficiency.</p>
                <ul className="list-disc list-inside">
                  <li>Data-driven staff allocation</li>
                  <li>Peak time predictions</li>
                  <li>Performance analytics dashboard</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="min-h-screen flex flex-col justify-center items-center px-4 py-8">
          <h2 className="text-4xl font-bold text-center mb-12">What Our Customers Say</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
            <Card className="bg-white text-black">
              <CardContent className="pt-6">
                <p className="italic mb-4">"Digital Queue has revolutionized our customer service. We've seen a 30% increase in customer satisfaction since implementing it. The real-time updates have significantly reduced customer frustration and improved our overall service quality."</p>
                <p className="font-semibold">- Jane Doe, CEO of RetailCo</p>
                <div className="mt-4 flex items-center">
                  <Image src="https://placehold.co/50x50" alt="Jane Doe" width={50} height={50} className="rounded-full mr-4" />
                  <div>
                    <p className="font-medium">RetailCo</p>
                    <p className="text-sm text-gray-500">Retail Industry</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white text-black">
              <CardContent className="pt-6">
                <p className="italic mb-4">"The ease of use and the insights we get from Digital Queue are incredible. It's a game-changer for our business. We've optimized our staffing based on peak times identified by the system, leading to a 20% reduction in operational costs."</p>
                <p className="font-semibold">- John Smith, Operations Manager at ServicePro</p>
                <div className="mt-4 flex items-center">
                  <Image src="https://placehold.co/50x50" alt="John Smith" width={50} height={50} className="rounded-full mr-4" />
                  <div>
                    <p className="font-medium">ServicePro</p>
                    <p className="text-sm text-gray-500">Service Industry</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="mt-12 text-center">
            <h3 className="text-2xl font-semibold mb-4">Our Impact</h3>
            <div className="flex justify-center space-x-12">
              <div className="text-center">
                <p className="text-4xl font-bold text-blue-500">500+</p>
                <p className="text-gray-300">Businesses Served</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-green-500">1M+</p>
                <p className="text-gray-300">Happy Customers</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-yellow-500">40%</p>
                <p className="text-gray-300">Average Wait Time Reduction</p>
              </div>
            </div>
          </div>
        </section>

        <section className="min-h-screen flex flex-col justify-center items-center px-4 py-8 bg-gray-900">
          <h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full max-w-2xl">
            <AccordionItem value="item-1">
              <AccordionTrigger>How does Digital Queue work?</AccordionTrigger>
              <AccordionContent>
                <p>Digital Queue uses advanced algorithms to manage and optimize queues, providing real-time updates to both businesses and customers. It integrates with your existing systems to streamline the entire queuing process.</p>
                <ul className="list-disc list-inside mt-2">
                  <li>Customers join the queue virtually</li>
                  <li>Real-time updates are sent to their devices</li>
                  <li>Businesses manage queues through our dashboard</li>
                  <li>Analytics provide insights for optimization</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Is Digital Queue suitable for my business?</AccordionTrigger>
              <AccordionContent>
                <p>Digital Queue is versatile and can be adapted to various industries, including retail, healthcare, government services, and more. Our flexible system can be customized to meet the specific needs of your business, regardless of size or sector.</p>
                <p className="mt-2">Some industries that benefit from Digital Queue:</p>
                <ul className="list-disc list-inside mt-2">
                  <li>Retail stores</li>
                  <li>Restaurants</li>
                  <li>Healthcare facilities</li>
                  <li>Government offices</li>
                  <li>Banks and financial institutions</li>
                  <li>Theme parks and attractions</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>How can I get started with Digital Queue?</AccordionTrigger>
              <AccordionContent>
                <p>Getting started with Digital Queue is easy:</p>
                <ol className="list-decimal list-inside mt-2">
                  <li>Download our app from the Google Play Store</li>
                  <li>Create an account for your business</li>
                  <li>Follow the easy setup instructions in the app</li>
                  <li>Customize your queue settings</li>
                  <li>Start managing your queues more efficiently!</li>
                </ol>
                <p className="mt-2">For business accounts, please contact our sales team for a personalized onboarding process and to discuss integration with your current systems.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>What kind of support do you offer?</AccordionTrigger>
              <AccordionContent>
                <p>We offer comprehensive support to ensure you get the most out of Digital Queue:</p>
                <ul className="list-disc list-inside mt-2">
                  <li>24/7 customer support via chat, email, and phone</li>
                  <li>Technical assistance for setup and troubleshooting</li>
                  <li>User training sessions for your staff</li>
                  <li>Regular system updates and new feature rollouts</li>
                  <li>Dedicated account manager for enterprise clients</li>
                  <li>Online knowledge base and video tutorials</li>
                </ul>
                <p className="mt-2">Our dedicated support team is committed to your success with Digital Queue.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </main>

      <footer className="bg-white text-black py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Digital Queue</h3>
              <p className="text-gray-600">&copy; 2023 Digital Queue. All rights reserved.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-600 hover:text-black">Features</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-black">Pricing</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-black">Case Studies</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-600 hover:text-black">About Us</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-black">Careers</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-black">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-600 hover:text-black">Privacy Policy</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-black">Terms of Service</Link></li>
                <li><Link href="/auth" className="text-gray-600 hover:text-black">Admin Login</Link></li>
                <li><Link href="/login" className="text-gray-600 hover:text-black">Super Admin Login</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
