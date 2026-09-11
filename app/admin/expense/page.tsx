import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import AdminExpenseClient from './AdminExpenseClient';

export const metadata = {
  title: 'จัดการใบเบิก | Admin',
  description: 'อนุมัติหรือปฏิเสธใบเบิกค่าใช้จ่ายของพนักงาน',
};

export default async function AdminExpensePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/login');

  const role = (session.user as { role?: string })?.role;
  if (role !== 'ADMIN') redirect('/');

  return <AdminExpenseClient />;
}
