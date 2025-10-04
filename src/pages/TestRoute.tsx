export default function TestRoute() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-green-600">✅ Test Route Working!</h1>
        <p className="text-gray-600 mt-2">If you can see this, React Router is working correctly.</p>
        <p className="text-sm text-gray-500 mt-4">Current URL: {window.location.href}</p>
      </div>
    </div>
  );
}
