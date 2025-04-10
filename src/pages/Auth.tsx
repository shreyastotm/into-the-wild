
import Layout from '@/components/Layout';
import AuthForm from '@/components/auth/AuthForm';

export default function Auth() {
  return (
    <Layout>
      <div className="flex justify-center items-center py-10">
        <div className="w-full max-w-md">
          <AuthForm />
        </div>
      </div>
    </Layout>
  );
}
