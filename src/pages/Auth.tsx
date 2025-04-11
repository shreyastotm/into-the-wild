
import AuthForm from '@/components/auth/AuthForm';

export default function Auth() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex justify-center items-center">
        <div className="w-full max-w-md">
          <AuthForm />
        </div>
      </div>
    </div>
  );
}
