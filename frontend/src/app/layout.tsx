import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "채용 정보 검색 | Job Search App",
  description: "다양한 채용 정보를 한 곳에서 검색하고 지원하세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-start h-16 items-center">
              <div className="flex-shrink-0">
                <Link href="/" className="text-xl font-bold text-blue-600">
                  Job Search App
                </Link>
              </div>
            </div>
          </div>
        </header>

        {children}

        <footer className="bg-gray-800 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Job Search App</h3>
                <p className="text-gray-300">
                  다양한 채용 정보를 한 곳에서 검색하고 지원하세요.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">서비스</h3>
                <p className="text-gray-300">
                  실시간 채용공고 검색 및 정보 제공
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">고객센터</h3>
                <p className="text-gray-300">
                  문의사항이 있으시면 언제든지 연락주세요.
                </p>
                <p className="text-gray-300 mt-2">
                  이메일: support@jobsearchapp.com
                </p>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
              <p>© 2025 Job Search App. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
