import { redirect } from 'next/navigation';

/** Old Prepare URL — keep bookmarks working. */
export default function PrepareRedirectPage() {
    redirect('/planner?tab=checklist');
}
