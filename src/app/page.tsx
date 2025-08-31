import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { ROUTES } from '@/constants'

export default async function HomePage() {
  const session = await getSession();

  if (session.isAuthenticated) {
    redirect(ROUTES.DASHBOARD);
  } else {
    redirect(ROUTES.LOGIN);
  }
}
