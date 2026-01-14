import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface BoardPageProps {
  params: Promise<{ locale: string; boardId: string }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { locale, boardId } = await params;

  // Redirect to backlog by default
  redirect(`/${locale}/board/${boardId}/backlog`);
}
