export function HomeContent() {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-semibold text-[#2563eb]">
        Account Overview
      </h1>
      <div className="space-y-4">
        <div className="rounded-lg border border-gray-200 p-4">
          <h2 className="mb-2 text-sm font-medium">System Status</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>CPU Usage: 45%</p>
            <p>Memory: 8GB / 16GB</p>
            <p>Network Speed: 100 Mbps</p>
          </div>
        </div>
      </div>
    </div>
  )
}
