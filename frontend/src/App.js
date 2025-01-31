import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import AddEvent from './pages/AddEvent';
import EditEvent from './pages/EditEvent';
import Layout from './Layout';
import NoPage from './pages/NoPage';
import Register from './pages/Register';
import Login from './pages/Login';
import MyAccount from './pages/MyAccount';
import MyEvents from './pages/MyEvents';

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem('token') !== null;

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const ProtectedAdminRoute = ({ children }) => {
  const isAdmin = JSON.parse(localStorage.getItem('isAdmin'));

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NoPage />,
    children: [
      // Public Routes
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/register',
        element: <Register />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/my-account',
        element: (
          <ProtectedRoute>
            <MyAccount />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/add_event',
        element: (
          <ProtectedAdminRoute>
            <AddEvent />
          </ProtectedAdminRoute>
        ),
      },
      {
        path: '/admin/edit-event/:id',
        element: (
          <ProtectedAdminRoute>
            <EditEvent />
          </ProtectedAdminRoute>
        ),
      },
      {
        path: '/admin/events',
        element: (
          <ProtectedAdminRoute>
            <MyEvents />
          </ProtectedAdminRoute>
        ),
      },
      // 404 route
      {
        path: '*',
        element: <NoPage />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
