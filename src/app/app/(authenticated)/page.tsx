import { redirect } from 'next/navigation';

export default function Page() {
  // 服务端重定向到工作流页面
  redirect('/app/workflows');
}
