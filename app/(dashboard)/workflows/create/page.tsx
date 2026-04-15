import { redirect } from 'next/navigation'

export default function CreateWorkflowPage() {
  redirect('/workflows?create=true')
}
