export default function DebugStaticPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Static Debug Page</h1>
      <p>If you can see this, static pages are working!</p>
      <p>Build time: {new Date().toISOString()}</p>
      
      <h2 className="text-xl font-semibold mt-4">Test Links:</h2>
      <ul className="list-disc list-inside mt-2 space-y-2">
        <li>
          <a href="/api/vercel-debug" className="text-blue-600 hover:underline">
            API Debug Endpoint
          </a>
        </li>
        <li>
          <a href="/test/123" className="text-blue-600 hover:underline">
            Dynamic Route Test (/test/123)
          </a>
        </li>
        <li>
          <a href="/deal/lhr-bcn-28072025" className="text-blue-600 hover:underline">
            Deal Page (lhr-bcn-28072025)
          </a>
        </li>
        <li>
          <a href="/api/debug/deals" className="text-blue-600 hover:underline">
            Debug Deals API
          </a>
        </li>
      </ul>
    </div>
  )
}