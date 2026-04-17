import { getCateringRequestById } from '@/app/actions/catering-actions';
import { CateringQuotationForm } from '@/components/admin/catering-quotation-form';
import { notFound } from 'next/navigation';

export default async function AdminCateringDetailPage({ params }: { params: { id: string } }) {
  const request = await getCateringRequestById(params.id);

  if (!request) {
    notFound();
  }

  return <CateringQuotationForm request={request} />;
}
