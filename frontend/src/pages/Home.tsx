import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
export function HomePage() {
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();
    if (!user) {
        navigate('/auth/login');
        return null;
    }
    return (<div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Instagram Clone</h1>
        <p className="text-xl text-gray-600 mb-8">Logged in as {user.username}</p>
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <p className="text-gray-500">Feed coming soon...</p>
        </div>
      </div>
    </div>);
}
