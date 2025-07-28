interface DealPageProps {
  params: { slug: string }
}

export default function DealPage({ params }: DealPageProps) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Deal Page Test</h1>
      <p>Slug: {params.slug}</p>
    </div>
  )
}