"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { SearchBox } from "@/components/search-box"
import { ReportDisplay } from "@/components/report-display"

export default function Home() {
  const [reportData, setReportData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (query: string) => {
    setIsLoading(true)

    // TODO: Replace with actual API call
    // Simulating API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock data - will be replaced with actual API response
    const mockData = {
      type: "chain", // or 'defi'
      name: query,
      // ... other data
    }

    setReportData(mockData)
    setIsLoading(false)
  }

  return (
    <main className="relative min-h-screen">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Header />

        <div className="mt-12 md:mt-20">
          <SearchBox onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {reportData && (
          <div className="mt-16 md:mt-24">
            <ReportDisplay data={reportData} />
          </div>
        )}
      </div>
    </main>
  )
}
