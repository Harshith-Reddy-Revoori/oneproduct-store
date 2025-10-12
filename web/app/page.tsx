import { prisma } from '@/lib/prisma';

function toPlain<T>(data: T): T {
  // Convert bigint -> number for safe JSON display (our prices are small)
  return JSON.parse(
    JSON.stringify(data, (_, v) => (typeof v === 'bigint' ? Number(v) : v))
  );
}

export default async function Home() {
  const product = await prisma.products.findFirst({
    where: { active: true },
    include: {
      product_sizes: {
        where: { is_active: true },
        orderBy: { label: 'asc' },
      },
    },
  });

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold">One-Product Store</h1>
      <p className="mt-2">Live data from your database:</p>
      <pre className="mt-6 rounded-lg bg-gray-100 p-4 text-sm overflow-auto">
        {JSON.stringify(toPlain(product), null, 2)}
      </pre>
    </main>
  );
}
