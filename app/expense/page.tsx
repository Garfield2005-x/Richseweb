import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { redirect } from 'next/navigation';
import ExpenseFormClient from './ExpenseFormClient';

export const metadata = {
  title: 'ใบเบิกค่าใช้จ่าย | Richse Skin8',
  description: 'ระบบยื่นใบเบิกค่าใช้จ่ายสำหรับพนักงาน',
};

export default async function ExpensePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect('/login?callbackUrl=/expense');
  }

  return <ExpenseFormClient />;
}
