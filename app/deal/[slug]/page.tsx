export default function DealPage({ params }: { params: { slug: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Deal Page</h1>
      <p>Slug: {params.slug}</p>
    </div>
  )
}