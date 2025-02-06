export function ProfileContent() {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-semibold text-[#2563eb]">
        Asset Management
      </h1>
      <div className="space-y-4">
        <div className="rounded-lg border border-gray-200 p-4">
          <h2 className="mb-2 text-sm font-medium">System Information</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Operating System: macOS 13.1</p>
            <p>Browser: Chrome 120.0</p>
            <p>Screen Resolution: 1920 x 1080</p>
          </div>
        </div>
      </div>
    </div>
  )
}
