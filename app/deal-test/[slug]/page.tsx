export default async function DealTestPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Deal Test Page</h1>
      <p>Slug: {resolvedParams.slug}</p>
      <p>This is a minimal test page for debugging.</p>
    </div>
  )
}