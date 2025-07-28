interface TestPageProps {
  params: Promise<{ id: string }>
}

export default async function TestPage({ params }: TestPageProps) {
  const { id } = await params
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dynamic Route Test</h1>
      <p>If you can see this, dynamic routes are working!</p>
      <p>ID parameter: <strong>{id}</strong></p>
      <p>Environment: {process.env.NODE_ENV}</p>
      <p>Vercel: {process.env.VERCEL ? 'Yes' : 'No'}</p>
    </div>
  )
}