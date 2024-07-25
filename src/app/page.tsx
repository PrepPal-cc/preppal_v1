import Header from '@/components/common/Header';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-[#E7ECFF] to-white overflow-hidden">
      <Header />
      {/* Hero section */}
      <section className="flex-grow relative">
        {/* Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-8">
            <div className="max-w-xl">
              <h1 className="text-4xl md:text-5xl font-bold text-[#091133] leading-tight mb-4">
                Build Professional Rapport Quickly & Effectively
              </h1>
              <p className="text-base md:text-lg text-[#505F98] mb-6">
                Preparing for meetings by thoroughly researching and understanding the
                backgrounds, interests, and goals of those you&apos;ll meet helps build rapport and
                demonstrate professionalism. Effective preparation shows commitment to
                creating mutually beneficial relationships, increasing success in business endeavors.
              </p>
              <div className="flex space-x-4">
                <Link href="/prep" className="px-6 py-2 bg-[#111B47] text-white font-medium rounded-sm inline-block">
                  Get Started
                </Link>
                <Link href="/about" className="px-6 py-2 border border-[#091133] text-[#091133] font-medium rounded-sm inline-block">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* SVG Image */}
        <div className="absolute right-0 top-0 w-1/2 h-full">
          <Image
            src="/images/auth/designer_1.svg"
            alt="Designer working"
            layout="fill"
            objectFit="contain"
            objectPosition="right center"
          />
        </div>
      </section>
    </div>
  );
}